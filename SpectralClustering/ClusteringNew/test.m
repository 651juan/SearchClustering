%circlesdata;
gaussiandata

sigma = 2;
nbclusters = 2;

[clusters, evalues, evectors] = spcl(data, nbclusters, sigma, 'kmean', [2 2]);