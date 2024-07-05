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
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [recipeList, setRecipeList] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipeName || !ingredients || !instructions) {
      setError('All fields are required.');
      return;
    }
    setError('');
    try {
      const data = await axios.post(`${baseUrl}/`, {
        recipe_name: recipeName,
        ingredients: ingredients,
        instructions: instructions
      });
      setRecipeList([...recipeList, data.data]);
      setRecipeName('');
      setIngredients('');
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
    const data = await axios.get(`${baseUrl}/`);
    const { Recipes: recipes } = data.data;
    setRecipeList(recipes);
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

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
              onChange={e => setRecipeName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="ingredients">Ingredients:</label>
            <textarea
              type="text"
              name="ingredients"
              id="ingredients"
              value={ingredients}
              onChange={e => setIngredients(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="instructions">Instructions:</label>
            <textarea
              name="instructions"
              id="instructions"
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
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
              {recipe.recipe_name}
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
        const data = await axios.get(`${baseUrl}/${id}`);
        setRecipe(data.data);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchRecipe();
  }, [id]);

  if (!recipe) return <div>No recipe yet.</div>;

  return (
    <div className="App">
      <div className="recipe-details">
        <h2>{recipe.recipe_name}</h2>
        <p><strong>Ingredients:</strong> {recipe.ingredients}</p>
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
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const data = await axios.get(`${baseUrl}/${id}`);
        setRecipe(data.data);
        setRecipeName(data.data.recipe_name);
        setIngredients(data.data.ingredients);
        setInstructions(data.data.instructions);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchRecipe();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipeName || !ingredients || !instructions) {
      setError('All fields are required.');
      return;
    }
    setError('');
    try {
      await axios.put(`${baseUrl}/${id}`, {
        recipe_name: recipeName,
        ingredients: ingredients,
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
            onChange={e => setRecipeName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="ingredients">Ingredients:</label>
          <textarea
            type="text"
            name="ingredients"
            id="ingredients"
            value={ingredients}
            onChange={e => setIngredients(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="instructions">Instructions:</label>
          <textarea
            name="instructions"
            id="instructions"
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
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
