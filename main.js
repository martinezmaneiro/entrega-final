//Inicializo el array que va a contener las entradas de los pokemones una vez hecho el fetch a la api
let pokedex = [];
//Inicializo el indice de inicio
let currentIndex = 0;

//Asigno variables de interes para asignarle funcionalidad a los elementos correspondientes
const load = document.querySelector('#load-pokemon');
const prev = document.querySelector('#previous-pokemon');
const next = document.querySelector('#next-pokemon');
const screens = document.querySelectorAll('.off');
const containerImg = document.querySelector('#pokemon-info .img-container');
const favoriteButton = document.querySelector('#favorite'); 

//Cada boton va a gatillar una funcionalidad diferente al escuchar el evento de click
load.addEventListener('click', loadPokemon);
prev.addEventListener('click', showPreviousPokemon);
next.addEventListener('click', showNextPokemon);
favoriteButton.addEventListener('click', toggleFavorite);

function loadPokemon() {
    //Modifica clases de los elementos para alterar los estilos aplicados
    prev.classList.remove("inactive");
    next.classList.remove("inactive");
    load.classList.add("inactive");

    screens.forEach((screen)=>{
        screen.classList.remove('off');
    });

    //Creamos dinamicamente (para la consigna) la etiqueta de imagen que contendra el source que nos de la api
    const img = document.createElement("IMG");
    img.id = "pokemon-image";
    containerImg.appendChild(img);

    //Nos traemos la data desde la api con fetch. Limitamos a la primera generacion mediante un query param.
    fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
        .then(response => response.json())
        .then(data => {

            //Por cada pokemon obtenido hacemos un fetch para obtener los detalles que necesitamos imprimir en la pokedex
            const pokemonPromises = data.results.map(pokemon => fetch(pokemon.url).then(res => res.json()));
            //Una vez obtenemos todos los datos que necesitamos, llenamos nuestra pokedex (el array vacio que habiamos creado en un principio)
            //Nos traemos los mejores sprites (gbc segunda generacion)
            Promise.all(pokemonPromises).then(pokemonDataArray => {
                pokedex = pokemonDataArray.map(pokemonData => ({
                    name: pokemonData.name,
                    image: pokemonData.sprites.versions['generation-ii'].crystal.front_default,
                    type: pokemonData.types.map(typeInfo => typeInfo.type.name).join(', '),
                    speciesUrl: pokemonData.species.url
                }));

                currentIndex = 0;
                //Mostramos el primer resultado
                displayPokemon(currentIndex);
            });
        })
        .catch(error => console.error('Error al cargar los Pokémon:', error));
}

//Completamos las etiquetas con la informacion correspondiente al pokemon que queremos mostrar en pantalla
function displayPokemon(index) {
    const pokemon = pokedex[index];
    document.querySelector('#pokemon-image').src = pokemon.image;
    document.querySelector('#pokemon-name').textContent = capitalizeFirstLetter(pokemon.name);
    document.querySelector('#pokemon-type').textContent = `Tipo: ${pokemon.type}`;

    // Verificar si el pokemon está en favoritos
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const isFavorite = favorites.some(fav => fav.name === pokemon.name);
    if (isFavorite) {
        favoriteButton.classList.add('fav');  // Agrega la clase si es favorito
    } else {
        favoriteButton.classList.remove('fav');  // Quita la clase si no es favorito
    }
    //Hacemos otro fetch para obtener la descripcion del pokemon en español
    fetch(pokemon.speciesUrl)
        .then(response => response.json())
        .then(speciesData => {
            const description = speciesData.flavor_text_entries.find(entry => entry.language.name === 'es');
            document.querySelector('#pokemon-description').textContent = description ? description.flavor_text : 'Descripción no disponible.';
        })
        .catch(error => console.error('Error al cargar la descripción:', error));
}

//Llamamos a la funcion displayPokemon en funcion del indice en el cual estamos parados y volvemos a setear el indice si queda fuera del intervalo 0 - 150
function showPreviousPokemon() {
    if (currentIndex > 0) {
        currentIndex--;
        displayPokemon(currentIndex);
    } else {
        currentIndex = 150;
        displayPokemon(currentIndex);
    }
}

function showNextPokemon() {
    if (currentIndex < pokedex.length - 1) {
        currentIndex++;
        displayPokemon(currentIndex);
    } else {
        currentIndex = 0;
        displayPokemon(currentIndex);
    }
}

//Guarda favoritos en local storage
function toggleFavorite() {
    const pokemon = pokedex[currentIndex];
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    if (favorites.some(fav => fav.name === pokemon.name)) {
        // Si ya está en favoritos se elimina del storage
        favoriteButton.classList.remove("fav");
        const updatedFavorites = favorites.filter(fav => fav.name !== pokemon.name);
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    
    } else {
        // Si no está en favoritos lo agregamos
        favoriteButton.classList.add("fav");
        favorites.push(pokemon);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
}

//Esta funcion auxiliar la usamos para capitalizar el nombre del pokemon a imprimir ya que la api nos lo ofrece en lowercase (y el curso no es de css)
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
