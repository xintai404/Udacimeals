import React from 'react'

const trim = (str) => {
	return str.length > 16? str.slice(0,16) +"..." : str
}

export default ({foods, onSelect}) => {
	if(foods.length === 0){
		return <p> Your search has 0 results. </p>
	}

	return (

		<ul className="food-list">
			{foods.map((food) => (
				<li key={food.label} onClick={()=>onSelect(food)}>
					<h3>{trim(food.label)}</h3>
					<img src={food.image} alt={food.label} />

					<div>{Math.floor(food.calories)}</div>
					<div>{food.source}</div>
				</li>
			))}
		</ul>
	)
}