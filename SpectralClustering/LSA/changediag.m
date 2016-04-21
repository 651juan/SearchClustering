for i = 1:100   x = importdata(strcat('file (',int2str(i),').csv'));
   x(logical(eye(size(A)))) = 0;
   [U,S,V] = svd(x);
   [m,n] = size(S);
   if mod(m,2) == 0
       h = m/2;
   else 
       h = (m-1)/2;
   end
   for j = h:m
       for k = 1:n
           if j == k 
               S(j,k) = 0;
           end
       end
   end
   x = U*S*V;
   csvwrite(strcat('c',int2str(i),'.csv'),x);
end