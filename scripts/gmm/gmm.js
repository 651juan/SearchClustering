function clusterResultsUsingGMM(resultObjects,configuration) {
	console.log("GMM");
		var rows = resultObjects;
        var labels = Array();
		for (var key in rows[0].data) {
			if (!rows[0].data.hasOwnProperty(key)) continue;
			labels.push(key);
		}
        var N_items = rows.length;

        var min = Array();//Array.apply(null, new Array(rows.length));
        var max = Array();//Array.apply(null, new Array(rows.length));
		
		for(var key in rows[0].data) {
			if(rows[0].data.hasOwnProperty(key)) {
				min[key] = 99999;
				max[key] = 1;
			}
		}

        var data = rows.map(function(row) {
		var x = Object.keys(row.data).map(function(key,i) {
			        min[key] = Math.min(min[key], row.data[key]);
                    max[key] = Math.max(max[key], row.data[key]);
					return row.data[key];
			});
			x["id"] = row.id;
			return x;
        });

        console.log(min);
        console.log(max);

        /* select data fields */
//        var data = table.map(function(row) { return row.slice(0,labels.length+1); });

        /* calculate mean and std. deviation */
        var mean = Array.apply(null, new Array(labels.length)).map(Number.prototype.valueOf,0);
        var X_sqr_sum = Array.apply(null, new Array(labels.length)).map(Number.prototype.valueOf,0);
        for (var i = 0; i < data.length; i++) {
            numeric.addeq(mean,data[i]);
            numeric.addeq(X_sqr_sum,numeric.mul(data[i],data[i]));
        }
        numeric.diveq(mean,N_items);
        var stddev = mean.map(function(x,i) {
            return Math.sqrt((X_sqr_sum[i] - (mean[i]*mean[i])*N_items)/(N_items - 1));
        });

        /* z - scaling */
        var data_scaled = data.map(function(row) {
            
			var x = numeric.sub(row,mean);
			x["id"] = row["id"];
			return x;
        });
        data_scaled = data_scaled.map(function(row) {
            var x = numeric.div(row,stddev);
			x["id"] = row["id"];
			return x;
        });

         /**
          * Dirichlet parameters
          * 
          * D: dimensionality of the input data
          * alpha: concentration parameter
          * maxIterations: maximum Markov chain sweeps
          */
         var dirichletParameters = {
            D: data_scaled[0].length,
            alpha: 0.1,
            maxIterations: 20
         };

        /**
         * The conjugate prior for a gaussian mixture
         * with unknown mean and unknown variance is
         * a normal inverse Wishnart distribution
         *
         * kappa0: 
         * nu0:
         * mu0:
         * psi0: 
         */
        var priorParameters = {
        	kappa0:     0.1,
        	nu0:        0.5,
          psi0: numeric.mul(numeric.identity(dirichletParameters.D),5)
        };

        console.log(data_scaled);

       var DPMM = new DPMixtureModel(GaussianComponent,dirichletParameters,priorParameters);
    	 DPMM.cluster(data_scaled);
    	 var clusters = DPMM.getClusters();		 
	var clustersReturn = Array();
	
	for(var clusterID in clusters) {
		var tmpCluster = {};
		var currentCluster = clusters[clusterID].getData();
		
		var documents = Array();
		tmpCluster.id = clusterID;
		
		for(var j = 0; j < Object.keys(currentCluster).length; j++) {
			var vectorIdx = currentCluster[j]["id"];
			documents[documents.length] = resultObjects[vectorIdx];
		}
		
		tmpCluster.documents = documents;
		clustersReturn[clustersReturn.length] = tmpCluster;
	}

        
return clustersReturn;
}