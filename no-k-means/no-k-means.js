function no_k_means(word_lists, threshold)
{
	var text_frequencies = [];
	var clusters = [];
	var cluster;
	var distances = [];
	var minimum_distance = 0;
	var search_words = [];
	var singles = [];
	var equality = false;
	//Get frequency vectors of words
	for (var i = 0; i < word_lists.length; i++)
	{
		text_frequencies.push(get_frequency(word_lists[i]));
	}
	//Start creating clusters
	for (var i = 0; i < text_frequencies.length; i++)
	{
		//If no clusters, create new cluster
		distances = [];
		if (clusters.length == 0)
		{
			clusters.push(new_cluster("test", [word_lists[i]], text_frequencies[i]));
		}
		//else compare with existing clusters
		else
		{
			for (var j = 0; j < clusters.length; j++)
			{
				distances.push(calc_cosine_distance(text_frequencies[i], clusters[j].frequencies));
			}
			minimum_distance = distances[0];
			cluster_position = 0;
			//Find minimum distance cluster
			for (var j = 0; j < distances.length; j++)
			{
				if (distances[j] < minimum_distance)
				{
					minimum_distance = distances[j];
					cluster_position = j;
				}
			}
			//If that minimum distance is larger than threshold, create new cluster
			if (minimum_distance > threshold)
			{
				clusters.push(new_cluster("test", [word_lists[i]], text_frequencies[i]));
			}
			//otherwise add text to the minimum distance cluster
			else
			{
				clusters[cluster_position].search_text.push(word_lists[i]);
				for (var j = 0; j < text_frequencies[i].length; j++)
				{
					equality = false;
					for (var k = 0; k < clusters[cluster_position].frequencies.length; k++)
					{
						if (text_frequencies[i][j].word == clusters[cluster_position].frequencies[k].word)
						{
							clusters[cluster_position].frequencies[k].frequency = (clusters[cluster_position].frequencies[k].frequency + text_frequencies[i][j].frequency)/2;
							equality = true;
						}
					}
					if (!(equality))
					{
						clusters[cluster_position].frequencies.push(text_frequencies[i][j]);
						clusters[cluster_position].frequencies[(clusters[cluster_position].frequencies.length)-1].frequency = clusters[cluster_position].frequencies[(clusters[cluster_position].frequencies.length)-1].frequency/2;
					}
				}
				clusters[cluster_position].size ++;
			}
		}
	}
	var i = 0;
	//Find singleton clusters in cluster list
	while (i < clusters.length)
	{
		if (clusters[i].size == 1){
			//Add those clusters to a list
			singles.push(clusters[i]);
			//Delete that singleton cluster from original cluster list
			clusters.splice(i, 1);
		}
		else
		{
			i++;
		}
	}
	//Join the singleton clusters into one cluster, and add that cluster to the original cluster list
	if (singles.length > 0)
	{
		var joined_cluster = join_clusters(singles);
		clusters.push(joined_cluster);
	}
	/*for (var i = 0; i < clusters[1].frequencies.length; i++)
	{
		console.log(clusters[1].frequencies[i].word);
		console.log(clusters[1].frequencies[i].frequency);
	}*/
	return clusters;
}

function get_frequency(word_list)
{
	var frequency_list = [];
	var equality = false;
	var counter = 0;
	for (var i = 0; i < word_list.length; i++)
	{
		counter = 0;
		equality = false;
		for (var j = 0; j < frequency_list.length; j++)
		{
			if (word_list[i] == frequency_list[j].word)
			{
				equality = true;
			}
		}
		if (!(equality))
		{
			for (var j = 0; j < word_list.length; j++)
			{
				if (word_list[i] == word_list[j])
				{
					counter++;
				}
			}
			var term =  {
				word:word_list[i], 
				frequency:counter
			};
			frequency_list.push(term);
		}
	}
	return frequency_list;
}

function calc_cosine_distance(frequency_list1, frequency_list2)
{
	var cosine_distance = {
		words:[],
		doc1_frequencies:[],
		doc2_frequencies:[],
		distance:0
	};
	var freq = 0;
	var equality = false;
	for (var i = 0; i < frequency_list1.length; i++)
	{
		freq = 0;
		equality = false;
		cosine_distance.words.push(frequency_list1[i].word)
		cosine_distance.doc1_frequencies.push(frequency_list1[i].frequency);
		for (var j = 0; j < frequency_list2.length; j++)
		{
			if (frequency_list1[i].word == frequency_list2[j].word)
			{
				freq = frequency_list2[j].frequency;
			}
		}
		cosine_distance.doc2_frequencies.push(freq);
	}
	for (var i = 0; i < frequency_list2.length; i++)
	{
		equality = false;
		for (var j = 0; j < cosine_distance.words.length; j++)
		{
			if (frequency_list2[i].word == cosine_distance.words[j])
			{
				equality = true;
			}
		}
		if (!(equality))
		{
			cosine_distance.words.push(frequency_list2[i].word);
			cosine_distance.doc1_frequencies.push(0);
			cosine_distance.doc2_frequencies.push(frequency_list2[i].frequency);
		}
	}
	//Dot Product
	var dot_product = 0;
	for (var i = 0; i < cosine_distance.words.length; i++)
	{
		dot_product = dot_product + (cosine_distance.doc1_frequencies[i] * cosine_distance.doc2_frequencies[i]);
	}
	//Scalar Product
	var scalar1 = 0;
	var scalar2 = 0;
	var scalar_product = 0;
	for (var i = 0; i < cosine_distance.words.length; i++)
	{
		scalar1 = scalar1 + Math.pow(cosine_distance.doc1_frequencies[i], 2);
		scalar2 = scalar2 + Math.pow(cosine_distance.doc2_frequencies[i], 2);
	}
	scalar_product = Math.sqrt(scalar1) * Math.sqrt(scalar2)
	//Cosine Angle
	cosine_distance.distance = Math.acos(dot_product/scalar_product);
	
	return cosine_distance.distance;
}

function new_cluster(cluster_name, word_list, text_frequency)
{
	cluster = {
		name:cluster_name,
		search_text:word_list,
		frequencies:text_frequency,
		size:word_list.length
	};
	return cluster;
}

function join_clusters(clusters)
{
	var word_list = [];
	var text_frequency = [];
	
	for (var i = 0; i < clusters.length; i++)
	{
		word_list.push(clusters[i].search_text);
		text_frequency.push(clusters[i].frequencies);
	}
	
	return new_cluster("Others", word_list, text_frequency);
}

function present_clusters(clusters)
{
	for (var i = 0; i < clusters.length; i++)
	{
		console.log("------------Cluster " + i + "------------");
		console.log(clusters[i].name);
		for (var j = 0; j < clusters[i].search_text.length; j++)
		{
			console.log("Search " + j);
			console.log(clusters[i].search_text[j].toString());
		}
		console.log("---------------------------------");
	}
}