import React, { createContext, useContext, useState } from "react";
import { createRoot } from "react-dom/client";

const diller = ["JavaScript", "Python"];

// __define-pcb__ Favori dil state'i için Context
const FavoriDilContext = createContext(null);

function App() {
	const varsayilanDil = diller[0];
	const [favori, setFavori] = useState(varsayilanDil);

	const favoriDegistir = () => {
		setFavori((onceki) =>
			onceki === diller[0] ? diller[1] : diller[0],
		);
	};

	return (
		<FavoriDilContext.Provider value={{ favori, favoriDegistir }}>
			<MainSection />
		</FavoriDilContext.Provider>
	);
}

function MainSection() {
	const { favori, favoriDegistir } = useContext(FavoriDilContext);

	return (
		<div>
			<p id="favoriteLanguage">
				favorite programing language: {favori}
			</p>
			<button id="changeFavorite" type="button" onClick={favoriDegistir}>
				toggle language
			</button>
		</div>
	);
}

const konteyner = document.getElementById("root");
const kok = createRoot(konteyner);
kok.render(<App />);
