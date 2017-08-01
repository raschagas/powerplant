import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import PropTypes from 'prop-types';
import { Grid, Button } from 'react-bootstrap';
import ItemList from './ItemList';
import AddItemPage from './AddItemPage';
import EditItemPage from './EditItemPage';
import SetHeaderTitle from '../SetHeaderTitle';

/**
 * @callback client.components.shared.CrudableList.CrudableListPage~createCallback
 * @param {Object} item the data of the item to be created
 */

/**
 * @callback client.components.shared.CrudableList.CrudableListPage~editCallback
 * @param {ObjectId|String} id the id of the item to be edited
 * @param {Object} changes the changes to be made to the item
 */

/**
 * @callback client.components.shared.CrudableList.CrudableListPage~deleteCallback
 * @param {ObjectId|String} id the id of the item to be deleted
 */

/**
 * React Component
 * Build a fully CRUDable list from a few template components and action functions
 * Typical usage is to have a redux-connected container component which builds the actions and passes all props in to the CrudableList
 * @namespace CrudableListPage
 * @memberof client.components.shared.CrudableList
 */
const CrudableListPage = ({
	actions,
	items,
	itemName,
	ItemListView,
	AddItemForm,
	match
}) => {
	const homeUrl = match.url;
	return (
		<Switch>
			<Route
				exact
				path={match.url}
				render={() =>
					<Grid>
						<SetHeaderTitle
							title={itemName.charAt(0).toUpperCase() + itemName.slice(1) + 's'}
						/>
						<ItemList
							deleteAction={actions.delete}
							match={match}
							items={items}
							ItemView={ItemListView}
							itemName={itemName}
						/>
						<LinkContainer to={`${match.url}/add`}>
							<Button bsStyle="floating">+</Button>
						</LinkContainer>
					</Grid>}
			/>
			<Route
				exact
				path={`${match.url}/add`}
				render={() =>
					<div>
						<SetHeaderTitle title={`Add ${itemName}`} />
						<AddItemPage
							AddItemForm={AddItemForm}
							itemName={itemName}
							onSubmit={actions.create}
							homeUrl={match.url}
						/>
					</div>}
			/>
			<Route
				exact
				path={`${match.url}/:id/edit`}
				render={({ match }) =>
					<div>
						<SetHeaderTitle title={`Edit ${itemName}`} />
						<EditItemPage
							EditItemForm={AddItemForm}
							editAction={actions.edit}
							itemName={itemName}
							id={match.params.id}
							homeUrl={homeUrl}
							items={items}
						/>
					</div>}
			/>
		</Switch>
	);
};

/**
 * @memberof client.components.shared.CrudableList.CrudableListPage
 * @prop {Object} actions      redux actions which the list will call - note that they must ALREADY be wrapped in dispatch calls
 * @prop {client.components.shared.CrudableList.CrudableListPage~createCallback} actions.create submit a request to save a new item
 * @prop {client.components.shared.CrudableList.CrudableListPage~editCallback} actions.edit submit a request to edit an existing item
 * @prop {client.components.shared.CrudableList.CrudableListPage~deleteCallback} actions.delete submit a request to delete an existing item
 * @prop {Object[]} items       the data to be displayed in the list
 * @prop {String} itemName     lowercase singular name of the type being displayed
 * @prop {client.components.shared.CrudableList.CrudableListPage.ItemListView} ItemListView A react component which displays a single list item
 * @prop {client.components.shared.CrudableList.CrudableListPage.AddItemForm} AddItemForm  A react component which renders a form for adding a new item
 * @prop {Object} match        react-router match parameter must be passed through
 */
CrudableListPage.propTypes = {
	actions: PropTypes.object.isRequired,
	items: PropTypes.array.isRequired,
	itemName: PropTypes.string.isRequired,
	ItemListView: PropTypes.func.isRequired,
	match: PropTypes.object.isRequired
};

export default CrudableListPage;
