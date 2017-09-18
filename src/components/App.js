import React, { Component } from 'react'
import { connect } from 'react-redux'
import { addRecipe, removeFromCalendar } from '../actions'
import { capitalize } from '../utils/helpers'
import { FaCalendarPlusO, FaArrowRight } from 'react-icons/lib/fa/';
import ReactModal from 'react-modal'
import ReactLoading from 'react-loading'
import FoodList from './FoodList'
import ShoppingList from './ShoppingList'
import {fetchRecipes} from '../utils/api'
    
class App extends Component {
  constructor(props){
    super();
    this.state = {
        shopListOpen: false,
        foodListOpen: false,
        waiting: false,
        food:null,
        day: null,
        meal: null
    }

    this.openFoodListModal = this.openFoodListModal.bind(this)
    this.closeFoodListModal = this.closeFoodListModal.bind(this)
    this.openShopListModal = this.openShopListModal.bind(this)
    this.closeShopListModal = this.closeShopListModal.bind(this)
    this.search = this.search.bind(this);

  }
  

  openFoodListModal(day, meal){
    this.setState({
      foodListOpen: true,
      day,
      meal
    })
  }

  closeFoodListModal(){
    this.setState({
      foodListOpen: false,
      day:null,
      meal:null,
      food:null
    })
  }

  openShopListModal(){
    this.setState({
      shopListOpen: true
    })
  }

  closeShopListModal(){
    this.setState({
      shopListOpen: false
    })
  }

  search(e){
    console.log(this.input.value)
    if(!this.input.value)return;

    e.preventDefault()

    this.setState({
      waiting: true
    })

    fetchRecipes(this.input.value)
    .then((food) => {
      this.setState({
        food,
        waiting: false
      })
    })
  }

  generateList(){
    let shoplist = []
    this.props.calendar.map((day) => {
       Object.keys(day.meals).map((k) =>{
        if(day.meals[k]){
         shoplist= shoplist.concat(day.meals[k].ingredientLines)
        }
       })
    })

    return shoplist;

  }

  render() {
    const { calendar, remove , selectRecipe} = this.props
    const mealOrder = ['breakfast', 'lunch', 'dinner']

    const {food, waiting} = this.state
    return (
      <div className='container'>
        <div className='nav'>
          <button className='shopping-list' onClick={this.openShopListModal}>
            Shopping List
          </button>
        </div>
        <ul className='meal-types'>
          {mealOrder.map((mealType) => (
            <li key={mealType} className='subheader'>
              {capitalize(mealType)}
            </li>
          ))}
        </ul>

        <div className='calendar'>
          <div className='days'>
            {calendar.map(({ day }) => <h3 key={day} className='subheader'>{capitalize(day)}</h3>)}
          </div>
          <div className='icon-grid'>
            {calendar.map(({ day, meals }) => (
              <ul key={day}>
                {mealOrder.map((meal) => (
                  <li key={meal} className='meal'>
                    {meals[meal]
                      ? <div className='food-item'>
                          <img src={meals[meal].image} alt={meals[meal].label}/>
                          <button onClick={() => remove({meal, day})}>Clear</button>
                        </div>
                      : <button className='icon-btn' onClick={() => this.openFoodListModal(day, meal)}>
                          <FaCalendarPlusO size={30}/>
                        </button>}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        <ReactModal
          className="modal"
          overlayClassName="overlay"
          isOpen={this.state.foodListOpen}
          onRequestClose={this.closeFoodListModal}
          contentLabel="add recipe modal" 
        >
            {
              waiting
              ?  <ReactLoading color="#222" delay={200} type="spin" className="loading"/>
              : <div className="search-container">
                  <h3 className="subheader">
                    Find a meal for {capitalize(this.state.day)} {this.state.meal}
                  </h3>
                  <div >
                    <form className="search" onSubmit={this.search}>
                      <input 
                        ref={(node) => this.input=node}
                        className="food-input"
                        type="text"
                        placeholder="search Foods"
                      />

                      <button type="submit" className="icon-btn">
                        <FaArrowRight size={30} />
                      </button>
                    </form>
                  </div>

                  {food != null && (
                    <FoodList 
                      foods={food} 
                      onSelect={(recipe)=>{
                        selectRecipe({recipe, day: this.state.day, meal: this.state.meal})
                        this.closeFoodListModal()
                      }}

                    />
                  )}
                </div>
            }

          <p><button onClick={this.closeFoodListModal}>Close</button></p>
        </ReactModal>


        <ReactModal
          className="modal"
          overlayClassName="overlay"
          isOpen={this.state.shopListOpen}
          onRequestClose={this.closeShopListModal}
          contentLabel="add recipe modal" 
        >

              <ShoppingList list={this.generateList()} />

          <p><button onClick={this.closeShopListModal}>Close</button></p>
        </ReactModal>
      </div>
    )
  }
}

function mapStateToProps ({ food, calendar }) {
  const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

  return {
    calendar: dayOrder.map((day) => ({
      day,
      meals: Object.keys(calendar[day]).reduce((meals, meal) => {
        meals[meal] = calendar[day][meal]
          ? food[calendar[day][meal]]
          : null

        return meals
      }, {})
    })),
  }
}

function mapDispatchToProps (dispatch) {
  return {
    selectRecipe: (data) => dispatch(addRecipe(data)),
    remove: (data) => dispatch(removeFromCalendar(data))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)