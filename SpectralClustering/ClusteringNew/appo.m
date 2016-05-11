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
        di(k-1) = DunnsIndexC(d,kclusters{k-1});
    end
    [mx,mxidx] = max(di);
    clusters = kclusters{mxidx};
    for j  = 1:size(clusters, 1)
       resultString = [resultString char(10) int2str(i) '.' int2str(clusters(j)) char(9) int2str(i) '.' int2str(j)];
    end
end
fileID = fopen(strcat('output-', num2str(sigma),'-C.txt'), 'w');
fprintf(fileID, resultString);

fclose(fileID);
sigma = sigma + 0.1;
end
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