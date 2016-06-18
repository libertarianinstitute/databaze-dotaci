
function getOperator(state) {
	for (var key in state) {
		if (state.hasOwnProperty(key))
			return key;
	}

	return null;
}

var handleChangeColumn = function(changeEq,e) {
	changeEq(e.target.value);
	this.replaceState({"$": e.target.value});
}

var columns = [{"title":"aa","value":"aa"}, {"title":"bb","value":"bb"}];

var columnSelector = React.createClass({
	getInitialState: function() {
		var data = this.props.data;
		if (columns.indexOf(data["$"]) == -1) {
			data["$"] = columns[0].value;
		}
		return this.props.data;
	},
	render: function() {
		options = columns.map(function(option) {
			return React.createElement("option", {"value": option.value, "key": option.value}, option.title);
		});

		return React.createElement("select", {"value": this.state["$"], "onChange": handleChangeColumn.bind(this,this.props.changeEq)}, options);
	}
});

var handleChangeValue = function(changeEq,e) {
	changeEq(e.target.value);
	this.replaceState({"_": e.target.value});
}

var valueSelector = React.createClass({
	getInitialState: function() {
		return this.props.data;
	},
	render: function() {
		return React.createElement("input", {"value": this.state["_"], "onInput": handleChangeValue.bind(this,this.props.changeEq)});
	}
});

var handleChangeEq = function(changeQuery, n, value) {
	var state = {
		data: [{"$": this.state.data[0]["$"]},{"_": this.state.data[1]["_"]}]
	}
	if (n==0) {
		state.data[0]["$"] = value;
	}
	if (n==1) {
		state.data[1]["_"] = value;
	}
	changeQuery("=", state.data);
	this.replaceState(state);
}

var eqOp = React.createClass({
	getInitialState: function() {
		if (!Array.isArray(this.props.data) || this.props.data.length != 2) {
			return {"data": [{"$":""},{"_":""}]};
		}
		return this.props;
	},
	render: function() {
		return React.createElement("div", null, [
			React.createElement(columnSelector, {"data": this.state.data[0], "changeEq": handleChangeEq.bind(this,this.props.changeQuery,0)}),
			React.createElement(valueSelector, {"data": this.state.data[1], "changeEq": handleChangeEq.bind(this,this.props.changeQuery,1)})
		]);
	}
});

var query;
var addQueryToAnd = function(changeQuery) {
	var state = {
		data: this.state.data.slice()
	}
	state.data.push({"=":[]});
	this.replaceState(state);
	changeQuery("&", state.data);
}

var handleChangeAnd = function(changeQuery,i,value) {
	var state = {
		data: this.state.data.slice()
	}
	state.data[i] = value;
	this.replaceState(state);
	changeQuery("&", state.data);
}

var andOp = React.createClass({
	getInitialState: function() {
		if (!Array.isArray(this.props.data)) {
			return {"data": []};
		}
		return this.props;
	},
	render: function() {
		var content = this.state.data.map(function(f,i) {
			return React.createElement(query, {"key": i, "data": f, "changeParent": handleChangeAnd.bind(this,this.props.changeQuery,i)});
		},this);
		content.push(React.createElement("button", {"onClick": addQueryToAnd.bind(this,this.props.changeQuery)}, "+"));
		return React.createElement("div", null, content);
	}
});

var addQueryToOr = function(changeQuery) {
	var state = {
		data: this.state.data.slice()
	}
	state.data.push({"=":[]});
	this.replaceState(state);
	changeQuery("|", state.data);
}

var handleChangeOr = function(changeQuery,i,value) {
	var state = {
		data: this.state.data.slice()
	}
	state.data[i] = value;
	this.replaceState(state);
	changeQuery("|", state.data);
}

var orOp = React.createClass({
	getInitialState: function() {
		if (!Array.isArray(this.props.data)) {
			return {"data": []};
		}
		return this.props;
	},
	render: function() {
		var content = this.state.data.map(function(f,i) {
			return React.createElement(query, {"key": i, "data": f, "changeParent": handleChangeOr.bind(this,this.props.changeQuery,i)});
		},this);
		content.push(React.createElement("button", {"onClick": addQueryToOr.bind(this,this.prop.changeQuery)}, "+"));
		return React.createElement("div", null, content);
	}
});


var handleChangeOperator = function(changeQuery, e) {
	this.replaceState({"data": e.target.value})
	changeQuery(e.target.value);
}

var handleChangeQuery = function(changeParent,operator, value) {
	var state = {};
	state[operator] = value || [];
	this.replaceState(state);
	changeParent(state);
}

var operatorSelector = React.createClass({
	getInitialState: function() {
		return this.props;
	},
	render: function() {
		var options = [
			{"title": "=", "value": "="},
			{"title": "A ZAROVEN", "value": "&"},
			{"title": "NEBO", "value": "|"}
		];
		options = options.map(function(option) {
			return React.createElement("option", {"value": option.value, "key": option.value}, option.title);
		});
		var self = this;
		return React.createElement("select", {"value": this.state.data, "onChange": handleChangeOperator.bind(this,this.props.changeQuery)}, options);
	}
});

var query = React.createClass({
	getInitialState: function() {
		return this.props.data;
	},
	render: function(){
		var content = [];
		content.push(React.createElement(operatorSelector, {"key": 0, "data": getOperator(this.state), "changeQuery": handleChangeQuery.bind(this,this.props.changeParent)}));
		switch (getOperator(this.state)){
			case '=': content.push(React.createElement(eqOp, {"key": 1, "data": this.state["="], "changeQuery": handleChangeQuery.bind(this,this.props.changeParent)}));
				break;
			case '&': content.push(React.createElement(andOp, {"key": 2, "data": this.state["&"], "changeQuery": handleChangeQuery.bind(this,this.props.changeParent)}));
				break;
			case '|': content.push(React.createElement(orOp, {"key": 3, "data": this.state["|"], "changeQuery": handleChangeQuery.bind(this,this.props.changeParent)}));
				break;
			
		}
 		return (React.createElement("div",null,content));
	}
});


ReactDOM.render(
        React.createElement(query,{"data": {"=": [{"$":"aa"},{"_":"test"}]}, "changeParent": function(state) { console.log(state);}}),
        document.getElementById('container')
);
