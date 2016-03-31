//var _ = require('underscore');

var Som = function(_config)
{
	var that = this;
	var config = _config ||{};
	
	var euclideanDistance = function(_vector1, _vector2)
	{
		var distance = 0;
		
		for (var i = 0, length = _vector1.length; i < length; i++)
		{
			var value1 = 0, value2 = 0;

			if (_vector1[i] !== null && _vector1[i] !== undefined) { value1 = _vector1[i]; }
			if (_vector2[i] !== null && _vector2[i] !== undefined) { value2 = _vector2[i]; }
			
			distance += Math.pow((value1 - value2), 2);
		}

		if (_vector2.length > _vector1.length)
		{
			for (var i = _vector1.length, length = (_vector2.length - _vector1.length); i < length; i++)
			{
				distance += Math.pow(_vector2[item], 2);
			}
		}

		return Math.sqrt(distance);
	};

	var max = function (_a, _b)
	{
		return (_a > _b) ? _a : _b;
	};

	this.traineeIndex = {};
	this.width = config.width || 100;
	this.height = config.height || 100;
	this.distanceFunction = config.distanceFunction || euclideanDistance;
	this.initialRadius = config.initialRadius || max(this.width, this.height)/2;
	this.iterationCount = config.iterationCount;
	this.initialLearningRate = config.initialLearningRate || 0.1;

	this.features = {};

	if (!config.features || config.features.length === 0)
	{
		throw Error('Provide the list of features for the vectors.');
	}
	else
	{
		config.features.forEach(function(_feature, _index)
		{
			that.features[_feature] = _index;
		});
	}
	
	this.currentIteration = 1;

	if (this.iterationCount === undefined || this.iterationCount === null)
	{
		throw Error('Provide in the config object the iteration count as {iterationCount: X} where X is the expected number of iterations');
	}

	this.nodeList = [];
};

var Node = function(_config)
{
	this.neighbors = {};
	
	if (!_config.weights)
	{
		throw Error('Provide weights for initialization of a node in the map');
	}

	this.weights = _config.weights;
	
	this.i = _config.i;
	this.x = _config.x;
	this.y = _config.y;
};

Node.prototype.add = function(_id, _vector, _category)
{
	var category = _category||'default';
	this.neighbors[category] = this.neighbors[category]||[]; 
	this.neighbors[category].push({id: _id});
};

Som.prototype.prepareNode = function(_features, _vector)
{
	var weights = [];

	_features.forEach(function(_feature)
	{
		var value = _vector[_feature];

		if (value === undefined || value === null)
		{
			console.log('assigning 0 to the value');
			value = 0;
		}
		else
		{
			console.log('assigning', value, 'to the value');
		}
		
		weights.push(value);
	});
	
	return new Node({weights: weights});
};

Som.prototype.index = function(_id, _node)
{
	this.traineeIndex[_id] = _node;
};

Som.prototype.neighbors = function(_id, _radius)
{
	var that = this;
	var neighbors = [];

	var bestMatchingNode = this.traineeIndex[_id];

	if (!bestMatchingNode)
	{
		throw Error('Unable to find node for id:' + _id);
	}

	var createVector = function(_features, _weights)
	{
		var vector = {};

		for (var feature in _features)
		{
			vector[feature] = _weights[_features[feature]];
		}
		
		return vector;
	};
	
	if (!_radius)
	{
		var vector = createVector(this.features, bestMatchingNode.weights);		
		neighbors.push({distance: 0, x: bestMatchingNode.x, y: bestMatchingNode.y, i: bestMatchingNode.i, vector: vector, neighbors: bestMatchingNode.neighbors});
	}
	else
	{
		
		//run through all the nodes and find the neighbors per node
		//within the given radius ...
		this.nodeList.forEach(function(_node)
		{
			if (_node.neighbors.length != 0)
			{
				var distance = that.distanceFunction(_node.weights, bestMatchingNode.weights);

				if (distance <= _radius)
				{
					var vector = createVector(that.features, _node.weights);
					neighbors.push({distance: distance, x: _node.x, y: _node.y, i: _node.i, vector: vector, neighbors: _node.neighbors});
				}
			}
		});
		
		neighbors;
	}

	return neighbors;
};

Som.prototype.train = function(_id, _vector)
{
	var that = this;
	
	var currentIteration = this.currentIteration;

	if (currentIteration > this.iterationCount)
	{
		console.log('ERROR');
		throw Error('Cannot train anymore ... current iteration is greater than the expected iteration count of: ' + this.iterationCount);
	}
	
	this.currentIteration += 1;

	var determineLocalRadius = function(_iteration)
	{
		var timeConstant = that.iterationCount/Math.log(that.initialRadius);
		
		return that.initialRadius * Math.exp(-(_iteration/timeConstant));
	};

	var determineLearningRate = function(_iteration)
	{
		return that.initialLearningRate * Math.exp(-(_iteration/that.iterationCount));
	};

	var radius = determineLocalRadius(currentIteration);
	var learningRate = determineLearningRate(currentIteration);

	var bestMatchingNode = this.bestMatchingUnit(_vector);
	bestMatchingNode.add(_id, _vector);
	this.index(_id, bestMatchingNode);
	
	this.nodeList.forEach(function(_node)
	{
		var distance = that.distanceFunction([bestMatchingNode.x, bestMatchingNode.y], [_node.x, _node.y]);

		if (distance < radius)
		{
			//adjust weights for this _node

			var influence = Math.exp(-(distance/2 * radius));

			if (influence <= 0) { influence = 1; }

			for (var feature in that.features)
			{
				var featureIndex = that.features[feature];
				var vectorFeature = _vector[feature]||0;
				_node.weights[featureIndex] = _node.weights[featureIndex] + (influence * learningRate * (vectorFeature - _node.weights[featureIndex]));
			}
		}
	});
};

Som.prototype.bestMatchingUnit = function(_vector)
{
	var bestMatchingUnit = this.nodeList[0];
	var smallestDistance = 100000000;
	var that = this;
	
	this.nodeList.forEach(function(_node)
	{
		var weights = [];
		
		for (var feature in _vector)
		{
			weights[that.features[feature]] = _vector[feature]||0;
		}
		
		var distance = that.distanceFunction(_node.weights, weights);

		if (distance < smallestDistance)
		{
			smallestDistance = distance;
			bestMatchingUnit = _node;
		}
	});

	return bestMatchingUnit;
};


Som.prototype.init = function(_config)
{
	var config = _config||{};
	var somSize = this.width * this.height;

	var randomize = function(_features, _somSize, _scale, _precision)
	{
		//We want to reduce to probability of a vector collision to
		//close to zero ... this allows us to avoid checking the node
		//list for duplicates.  This becomes more effective as the
		//feature count increases.

		var precision = Math.pow(10, _precision)|| Math.pow(10, (Math.ceil(Math.log(_somSize)/Math.LN10) + 2));
		var scale = _scale||1;
		
		var vector = [];

		for (feature in _features)
		{
			var featureIndex = _features[feature];
			vector[featureIndex] = Math.round(Math.random() * precision)/precision * scale;
			//vector[featureIndex] = 0;
		}
		
		return new Node({weights: vector});
	};
	
	if (config.nodes && config.nodes.length === somSize)
	{
		this.nodeList = config.nodeList;
	}
	else
	{
		var row = 0;
		var column = 0;
		
		for (var i = 0; i < somSize; i++)
		{
			var node = randomize(this.features, somSize, config.scale, config.precision);

			node.x = row;
			node.y = column;
			node.i = i;

			column++;

			if (column === this.width) { row++; column = 0; }

			this.nodeList.push(node);
		}
	}
};

var create = function (_config)
{
	return new Som(_config);
};



// Cluster results using SOM
var clusterResultsUsingSOM = function(results) {
	console.log("Training SOM");
	var originalResults = results.slice(0, results.length);
	// console.log("Input: ", originalResults);
	
	// Create lookup table
	var resultsLookup = {};
	for (var i = 0, len = originalResults.length; i < len; i++) {
		resultsLookup[originalResults[i].id] = originalResults[i];
	}
	
	// Get feature list from any document
	var wordList = Object.keys(results[0].data);
	
	// Create and initialise SOM
	var som = create({
		features: wordList, 
		initialLearningRate: 0.9,
		iterationCount: 1000, 
		width: 10, 
		height: 10
	});
	
	som.init({});
	
	// Train network with results as stimuli
	while(results.length > 0) {
		var i = Math.floor(Math.random()*results.length);
		som.train(results[i].id, results[i].data);
		results.splice(i, 1);
	};
	
	/* results.forEach(function(result) {
		som.train(result.id, result.data);
	}); */

	// Create and return clusters of documents from the organised map
	var clusters = Array();
	for (var i = 0; i < som.width * som.height; i++) {
		if (som.nodeList[i].neighbors.default) {
			var cluster = {id: i};
			var documents = Array();
			for (var j = 0; j < som.nodeList[i].neighbors.default.length; j++) {
				var neighbour_id = som.nodeList[i].neighbors.default[j].id;
				documents.push(resultsLookup[neighbour_id]);
			};
			cluster.documents = documents;
			clusters.push(cluster);
		}
	};
	
	return clusters;
};