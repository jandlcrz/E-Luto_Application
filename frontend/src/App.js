import axios from 'axios';
import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import './App.css';

const baseUrl = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<RecipeList />} />
        <Route exact path="/recipe/:id" element={<RecipeDetails />} />
        <Route exact path="/edit/:id" element={<EditRecipe />} />
      </Routes>
    </BrowserRouter>
  );
}

function RecipeList() {
  const [recipeName, setRecipeName] = useState('');
  const [ingredientsArray, setIngredientsArray] = useState(['']);
  const [instructions, setInstructions] = useState('');
  const [recipeList, setRecipeList] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipeName || ingredientsArray.some(ingredient => !ingredient) || !instructions) {
      setError('All fields are required.');
      return;
    }
    setError('');
    try {
      const data = await axios.post(`${baseUrl}/`, {
        recipe_name: recipeName,
        ingredients: ingredientsArray,
        instructions: instructions
      });
      setRecipeList([...recipeList, data.data]);
      setRecipeName('');
      setIngredientsArray(['']);
      setInstructions('');
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${baseUrl}/${id}`);
      const updatedRecipeList = recipeList.filter(recipe => recipe.id !== id);
      setRecipeList(updatedRecipeList);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleView = id => {
    navigate(`/recipe/${id}`);
  };

  const fetchRecipes = async () => {
    try {
      const { data } = await axios.get(`${baseUrl}/`);
      const { Recipes: recipes } = data;
      setRecipeList(recipes);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredientsArray];
    newIngredients[index] = value;
    setIngredientsArray(newIngredients);
  };

  const addIngredient = () => {
    setIngredientsArray([...ingredientsArray, '']);
  };

  const removeIngredient = (index) => {
    const newIngredients = [...ingredientsArray];
    newIngredients.splice(index, 1);
    setIngredientsArray(newIngredients);
  };

  return (
    <div className="App">
      <section>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="recipeName">Recipe Name:</label>
            <input
              type="text"
              name="recipeName"
              id="recipeName"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
            />
          </div>
          <div>
            <label>Ingredients:</label>
            {ingredientsArray.map((ingredient, index) => (
              <div className="ingredients-group" key={index}>
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => handleIngredientChange(index, e.target.value)}
                />
                {index !== 0 && <button type="button" onClick={() => removeIngredient(index)}>Remove</button>}
              </div>
            ))}
            <button type="button" onClick={addIngredient}>Add Ingredient</button>
          </div>
          <div>
            <label htmlFor="instructions">Instructions:</label>
            <textarea
              name="instructions"
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            ></textarea>
          </div>
          {error && <p className="error">{error}</p>}
          <button type='submit'>Submit</button>
        </form>
      </section>
      <section>
        <ul>
          {recipeList.map(recipe => (
            <li key={recipe.id}>
              <h3>{recipe.recipe_name}</h3>
              <div className="list-buttons">
                <button className="list-button" onClick={() => handleView(recipe.id)}>View</button>
                <button className="list-button" onClick={() => handleDelete(recipe.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function RecipeDetails() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const { data } = await axios.get(`${baseUrl}/${id}`);
        setRecipe(data);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchRecipe();
  }, [id]);

  if (!recipe) return <div>Loading...</div>;

  return (
    <div className="App">
      <div className="recipe-details">
        <h2>{recipe.recipe_name}</h2>
        <p><strong>Ingredients:</strong></p>
        <ul>
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
        <p><strong>Instructions:</strong> {recipe.instructions}</p>
        <div className="recipe-buttons">
          <button onClick={() => navigate('/')}>Go Back</button>
          <button onClick={() => navigate(`/edit/${id}`)}>Edit</button>
        </div>
      </div>
    </div>
  );
}

function EditRecipe() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [recipeName, setRecipeName] = useState('');
  const [ingredientsArray, setIngredientsArray] = useState([]);
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const data = await axios.get(`${baseUrl}/${id}`);
        setRecipe(data.data);
        setRecipeName(data.data.recipe_name);
        setIngredientsArray(data.data.ingredients);
        setInstructions(data.data.instructions);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchRecipe();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipeName || ingredientsArray.length === 0 || !instructions) {
      setError('All fields are required.');
      return;
    }
    setError('');
    try {
      await axios.put(`${baseUrl}/${id}`, {
        recipe_name: recipeName,
        ingredients: ingredientsArray,
        instructions: instructions
      });
      navigate(`/recipe/${id}`);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleCancel = () => {
    navigate(`/recipe/${id}`);
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredientsArray];
    newIngredients[index] = value;
    setIngredientsArray(newIngredients);
  };

  const addIngredient = () => {
    setIngredientsArray([...ingredientsArray, '']);
  };

  const removeIngredient = (index) => {
    const newIngredients = [...ingredientsArray];
    newIngredients.splice(index, 1);
    setIngredientsArray(newIngredients);
  };

  if (!recipe) return <div>Loading...</div>;

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="recipeName">Recipe Name:</label>
          <input
            type="text"
            name="recipeName"
            id="recipeName"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
          />
        </div>
        <div>
          <label>Ingredients:</label>
          {ingredientsArray.map((ingredient, index) => (
            <div className="ingredients-group" key={index}>
              <input
                type="text"
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
              />
              <button type="button" onClick={() => removeIngredient(index)}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={addIngredient}>Add Ingredient</button>
        </div>
        <div>
          <label htmlFor="instructions">Instructions:</label>
          <textarea
            name="instructions"
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          ></textarea>
        </div>
        {error && <p className="error">{error}</p>}
        <button type='submit'>Submit</button>
        <button type='button' onClick={handleCancel}>Cancel</button>
      </form>
    </div>
  );
}

export default App;
