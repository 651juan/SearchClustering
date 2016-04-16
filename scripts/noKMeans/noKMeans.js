function clusterResultsUsingNoKMeans(results, threshold)
{
	//console.log(threshold);
    var clusters = [];
    var distances = [];
    var min_index = 0;
    for (var i = 0; i < results.length; i++)
    {
    	distances = []
    	min_index = 0;
    	if (clusters.length == 0)
    	{
    		clusters.push(new_cluster([results[i]], clusters.length, clone_object(results[i].data)));
    	}
    	else
    	{
    		for (var j = 0; j < clusters.length; j++)
    		{
    			distances.push(calc_cosine_distance(results[i].data, clusters[j].data));
    		}
    		min_index = minimum_distance_index(distances);
    		if (distances[min_index] <= threshold)
    		{
    			clusters[min_index].documents.push(results[i]);
    			update(clusters[min_index], results[i]);
    		}
    		else
    		{
    			clusters.push(new_cluster([results[i]], clusters.length, clone_object(results[i].data)));
    		}
    	}
    }
    var singles_cluster = new_cluster([], 0, null);
    var i = 0;
    while (i < clusters.length)
    {
    	if (clusters[i].documents.length == 1)
    	{
    		console.log(i);
    		singles_cluster.documents.push(clusters[i].documents[0]);
    		clusters.splice(i, 1);
    	}
    	else
    	{
    		i++;
    	}
    }
    if (singles_cluster.documents.length > 0)
    {
    	clusters.push(singles_cluster);
    	index(clusters);
    }
    return clusters;
}

function calc_cosine_distance(frequency_list1, frequency_list2)
{
	//Dot Product
	var dot_product = 0;
	for (var frequency in frequency_list1)
	{
		dot_product = dot_product + (frequency_list1[frequency] * frequency_list2[frequency]);
	}
	//Scalar Product
	var scalar1 = 0;
	var scalar2 = 0;
	var scalar_product = 0;
	for (var frequency in frequency_list1)
	{
		scalar1 = scalar1 + Math.pow(frequency_list1[frequency], 2);
		scalar2 = scalar2 + Math.pow(frequency_list2[frequency], 2);
	}
	scalar_product = Math.sqrt(scalar1) * Math.sqrt(scalar2)
	//Cosine Distance
	var cosine_distance = dot_product/scalar_product;
	
	return cosine_distance;
}

function new_cluster(document_list, cluster_id, word_list)
{
	var cluster = {
		documents:document_list,
		id:cluster_id,
		data:word_list
	};
	return cluster;
}

function minimum_distance_index(distances)
{
	var minimum = distances[0];
	var minimum_index = 0;
	for (var j = 0; j < distances.length; j++)
	{
		if (distances[j] < minimum)
		{
			minimum = distances[j];
			minimum_index = j;
		}
	}
	return minimum_index;
}

function update(cluster, document)
{
	for (var frequency in cluster.data)
	{
		cluster.data[frequency] = (cluster.data[frequency] + document.data[frequency])/2;
	}
}

function clone_object(obj) 
{
    var temp = {};
    
    for (var frequency in obj)
    {
    	temp[frequency] = obj[frequency];
    }
    return temp;
}

function index(clusters)
{
	for (var i = 0; i < clusters.length; i++)
	{
		clusters[i].id = i;
	}
}