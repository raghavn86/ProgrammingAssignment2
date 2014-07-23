## This file provides cachable matrix datastructures.
# makeCacheMatrix -> creates a cachable matrix
# cacheSolve -> takes a cachable matrix and computes the inverse and caches the result

# makeCacheMatrix function makes a list of cache helper functions
# Takes in an optional parameter x with a default value of empty matrix
makeCacheMatrix <- function(x = matrix()) {
    # inverseOfX stores the inverse of matrix x. If cache is not available, inverseOfX will continue to be NULL
	inverseOfX <- NULL
	
	# sets the new value y to x and resets the cache. 
	# if <<- is not used a new variable 'x' will be created,in the function environment,
	# instead of modifying the makeCacheMatrix's x.
	set <- function(y) {
		x <<- y
		inverseOfX <<- NULL
	}
	# returns the store input matrix x
	get <- function() x
	
	#set cache and get cache
	setcache <- function(inverse) inverseOfX <<- inverse
	getcache <- function() inverseOfX
	list(set = set, get = get,
		 setcache = setcache,
		 getcache = getcache)
}

# This function takes as an input a cachable matrix created using makeCacheMatrix function, 
# and returns the inverse of the matrix from cache if cache is available, 
# otherwise computes the inverse, caches it and returns the inverse matrix
# This function assumes that the input matrix is a square invertible matrix (as per the assignment requierments)
cacheSolve <- function(x, ...) {

	# if cache is available return the cache inverse matrix
	inverseOfX <- x$getcache()
	
	if(!is.null(inverseOfX)) {
		message("getting cached matrix")
		return(inverseOfX)
	}
	
	# cache is not avilable, compute, cache and return the value
	inputMatrix <- x$get()
	
	# passes extended arguments provided to cacheSolve 
	inverseOfX <- solve(inputMatrix, ...)
	x$setcache(inverseOfX)
	inverseOfX
}

# This is a function to manually test if the cache works correctly.
cacheSolveTest <- function() {
	inputM = matrix(rnorm(9), 3,3)
	cachableMatrix <- makeCacheMatrix(x = inputM)
	print("Solving first time")
	cacheSolve(cachableMatrix)
	# the second time, it should print saying "getting cached matrix"
	print("Solving second time")
	cacheSolve(cachableMatrix)
}