x = importdata('datasets/Atom/atom.test.csv');
norm = normalizeData(x);
sim = SimGraph_NearestNeighbors(norm,5,1,1);
[A,B,C] = SpectralClustering(sim,7,2);
A;