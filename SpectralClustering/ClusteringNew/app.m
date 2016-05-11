function app
sigma = 0.1;
for j = 1:500
resultString = 'subTopicID	resultID';
fprintf('Processing Sigma %f of 5\n',sigma);
for i = 1:100
    fprintf('Processing document %d of 100\n',i);
    d = csvread(sprintf('./New100Results/%d.csv',i));

    for k = 2:20
        [kclusters{k-1}] = spcl(d, k, sigma, 'kmean', [2 2]);    
        di(k-1) = pbmE(d,kclusters{k-1});
    end
    [mx,mxidx] = max(di);
    clusters = kclusters{mxidx};
    for j  = 1:size(clusters, 1)
       resultString = [resultString char(10) int2str(i) '.' int2str(clusters(j)) char(9) int2str(i) '.' int2str(j)];
    end
end
fileID = fopen(strcat('output-PBM-', num2str(sigma),'-C.txt'), 'w');
fprintf(fileID, resultString);

fclose(fileID);
sigma = sigma + 0.1;
end
end

function p = pbmE(data,clusteridx)
%Ew
%Mean of all Documents
documentsMean = mean(data,1);
ET = 0;
for i = 1:size(data,1)
    %ET = ET + pdist([data(i,:);documentsMean],'cosine');
    ET = ET + norm(data(i,:) - documentsMean);
end  

%DB
%Find all the cluster centroids
EW = 0;
for i = 1:max(clusteridx)    
    samples = data(clusteridx == i,:);
    clusterCentroids(i,:) = mean(samples,1);
    %EW
    clusterSum = 0;
    for j = 1:size(samples,1)
        %clusterSum = clusterSum +  pdist([samples(j,:);clusterCentroids(i,:)],'cosine');
        clusterSum = clusterSum + norm(samples(j,:) - clusterCentroids(i,:));
    end 
    EW = EW + clusterSum;
end 
%DB = max(pdist(clusterCentroids,'cosine'));
DB = max(pdist(clusterCentroids));

ETEW = ET./ EW;
p = ((1./max(clusteridx)).*ETEW.*DB).^2;
end

function p = pbmC(data,clusteridx)
%Ew
%Mean of all Documents
documentsMean = mean(data,1);
ET = 0;
for i = 1:size(data,1)
    ET = ET + pdist([data(i,:);documentsMean],'cosine');
end  

%DB
%Find all the cluster centroids
EW = 0;
for i = 1:max(clusteridx)    
    samples = data(clusteridx == i,:);
    clusterCentroids(i,:) = mean(samples,1);
    %EW
    clusterSum = 0;
    for j = 1:size(samples,1)
        clusterSum = clusterSum +  pdist([samples(j,:);clusterCentroids(i,:)],'cosine');
    end 
    EW = EW + clusterSum;
end 
DB = max(pdist(clusterCentroids,'cosine'));

ETEW = ET./ EW;
p = ((1./max(clusteridx)).*ETEW.*DB).^2;
end

function d = DunnsIndexC(data,clusteridx)

% Compute intra variance
intra = 0;
N = size(data,1);
for i = 1:max(clusteridx)    
    samples = data(clusteridx == i,:);
    mu(i,:) = mean(samples,1);
    for j = 1:size(samples,1)
        intra = intra + pdist([samples(j,:);mu(i,:)],'cosine');
        %intra = intra + norm(samples(j,:) - mu(i,:));
    end    
end
intra = intra / N;

% Computer inter variance
inter = min(pdist(mu,'cosine'));

d = intra/inter;
end

function d = DunnsIndexE(data,clusteridx)

% Compute intra variance
intra = 0;
N = size(data,1);
for i = 1:max(clusteridx)    
    samples = data(clusteridx == i,:);
    mu(i,:) = mean(samples,1);
    for j = 1:size(samples,1)
        intra = intra + norm(samples(j,:) - mu(i,:));
    end    
end
intra = intra / N;

% Computer inter variance
inter = min(pdist(mu));

d = intra/inter;
end