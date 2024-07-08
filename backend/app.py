from flask import Flask, request, jsonify, abort
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_cors import CORS
from os import environ

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = environ.get('DB_URL')
db = SQLAlchemy(app)
CORS(app)

class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    recipe_name = db.Column(db.String(100), nullable=False)
    ingredients = db.Column(db.ARRAY(db.String), nullable=False)
    instructions = db.Column(db.String(1000), nullable=False)
    date_created = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return 'Recipe: %r' % self.recipe_name
    
    def __init__(self, recipe_name, ingredients, instructions):
        self.recipe_name = recipe_name
        self.ingredients = ingredients
        self.instructions = instructions

with app.app_context():
    db.create_all()

def format_recipe(recipe):
    return {
        "id": recipe.id,
        "recipe_name": recipe.recipe_name,
        "ingredients": recipe.ingredients,
        "instructions": recipe.instructions,
        "date_created": recipe.date_created
    }

@app.route("/", methods=['POST', 'DELETE', 'GET'])
def home():
    if request.method == 'POST':
        recipe_name = request.json['recipe_name']
        ingredients = request.json['ingredients']
        instructions = request.json['instructions']
        new_recipe = Recipe(recipe_name=recipe_name, ingredients=ingredients, instructions=instructions)
        try:
            db.session.add(new_recipe)
            db.session.commit()
            return jsonify(format_recipe(new_recipe))
        except Exception as e:
            db.session.rollback()
            abort(500, description=str(e))
    elif request.method == 'DELETE':
        id = request.json['id']
        recipe_to_delete = Recipe.query.filter_by(id=id).one_or_none()
        if not recipe_to_delete:
            abort(404, description="Recipe not found")
        try:
            db.session.delete(recipe_to_delete)
            db.session.commit()
            return jsonify({"message": "Recipe deleted"})
        except Exception as e:
            db.session.rollback()
            abort(500, description=str(e))
    else:
        recipes = Recipe.query.order_by(Recipe.recipe_name).all()
        recipe_list = [format_recipe(recipe) for recipe in recipes]
        return jsonify({"Recipes": recipe_list})

@app.route("/<int:id>", methods=['DELETE'])
def delete(id):
    recipe_to_delete = Recipe.query.filter_by(id=id).one_or_none()
    if not recipe_to_delete:
        abort(404, description="Recipe not found")
    try:
        db.session.delete(recipe_to_delete)
        db.session.commit()
        return jsonify({"message": "Recipe deleted"})
    except Exception as e:
        db.session.rollback()
        abort(500, description=str(e))

@app.route("/<int:id>", methods=['GET'])
def get_recipe(id):
    recipe = Recipe.query.filter_by(id=id).one_or_none()
    if not recipe:
        abort(404, description="Recipe not found")
    return jsonify(format_recipe(recipe))

@app.route("/<int:id>", methods=['PUT'])
def update(id):
    recipe_to_update = Recipe.query.filter_by(id=id).one_or_none()
    if not recipe_to_update:
        abort(404, description="Recipe not found")
    recipe_to_update.recipe_name = request.json['recipe_name']
    recipe_to_update.ingredients = request.json['ingredients']
    recipe_to_update.instructions = request.json['instructions']
    recipe_to_update.date_created = datetime.utcnow()
    try:
        db.session.commit()
        return jsonify({"message": "Recipe updated"})
    except Exception as e:
        db.session.rollback()
        abort(500, description=str(e))

if __name__ == '__main__':
    app.run(debug=True)
