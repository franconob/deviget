var app = angular.module('app', ['btford.socket-io']);

app.factory('socket', function(socketFactory) {
	return socketFactory({
		socket: io.connect('https://quiet-fortress-3448.herokuapp.com')
		//socket: io.connect('http://localhost:3000')
	});
});

app.controller('GameController', ['socket', '$scope', '$window', function(socket, $scope, $window) {

	var self = this;

	var player = $window.location.pathname.split('/')[2];

	if(player == 2) {
		$scope.missingPlayer = false;
		$scope.myTurn = false;
	} else {
		$scope.missingPlayer = true;
		$scope.myTurn = true;
	}

	$scope.gameEnded = false;

	var SIZE = 6;

	$scope.gridGame = new Array(SIZE);

	for(var i = 0; i < SIZE; i++) {
		$scope.gridGame[i] = new Array(6);
		for(var j = 0; j < SIZE; j++) {
  			$scope.gridGame[i][j] = {filled: false, col: j, row: i, style: '', player: player};
		}
	}

	function canPlay() {
		return true;
	};

	function checkVertical(headIndex, col, row, gridGame, me) {
		var minY = SIZE - row; 

		var hits = 0;
		
		if(minY < 4) {
			//console.log('todavia no chequeo');
		} else {
			//console.log('chequeo!!');
			for(var i = row; i < minY + row; i++) {
				var column = gridGame[i][headIndex];
				if(column.filled && column.player == me) {
					hits++;
				}
			}
		}

		return hits == 4;
	};

	function checkHorizontal(headIndex, col, row, gridGame, me) {
		var row = gridGame[row],
			minX = SIZE - (SIZE - headIndex),
			maxX = SIZE - minX,
			hits = 0;

		var i;
		for(i = headIndex; i >= 0; i--) {
			var cell = row[i];
			if(cell.filled && cell.player == me) {
				hits++;
			} else {
				break;
			}
		}

		return i;

		// firts, going to left
		var offset = null;
		
		/*
		if(hits < 4) {
			console.log('termine de ir a la izquierda. Encontre:', hits);
			//now, going to right
			for(var i = headIndex; i < SIZE - headIndex - 1; i++) {
				console.log('entrando en for a la derecha');
				var cell = row[i];
				if(cell.filled && cell.player == me) {
					hits++;
				} else {
					break;
				}
			}
		}
		*/

		if(hits == 4) {
			console.log('gane!!!');
			return true;
		} else {
			// now, going right
		}

		return hits == 4;
	};

	function hasWon(headIndex, lastMove, gridGame) {
		// check 4 directions posibilities
		var col = lastMove.col,
			row = lastMove.row,
			me  = player;

		return checkVertical(headIndex, col, row, gridGame, me)
		// || checkHorizontal(headIndex, col, row, gridGame, me);
	};

	$scope.play = function(e) {
		if(!canPlay()) {
			return false;
		}

		var headIndex = e.target.getAttribute('data-head');

		var col = $scope.gridGame[headIndex];
		var row = null;
		for(var i = SIZE-1; i >= 0; i--) {

			var row = $scope.gridGame[i];
			var col = row[headIndex];

			if(!col.filled) {
				col.filled = true;
				col.style = 'background-color: ' + $window.__COLOR;
				row = i;
				$scope.gridGame[i][headIndex] = col;
				console.log(hasWon(headIndex, col, $scope.gridGame));
				if(hasWon(headIndex, col, $scope.gridGame)) {
					socket.emit('game:played', {col: col, color: $window.__COLOR});
					socket.emit('game:ended', {player: player});
					$scope.gameEnded = true;
					$scope.messageEnd = {message: "You won!", cls: 'success'};
					alert('You won!');
					break;
				}
				$scope.myTurn = false;
				socket.emit('game:played', {col: col, color: $window.__COLOR});

				break;
		    }
	   }
	}

	socket.on('game:joined', function(users) {
		$scope.$apply(function() {
			$scope.missingPlayer = false;
		});
	});

	socket.on('game:played', function(data) {
		$scope.myTurn = true;
		$scope.gridGame[data.col.row][data.col.col] = data.col;
	});

	socket.on('game:ended', function(data) {
		$scope.$apply(function() {
			alert('You lost!!');
			$scope.gameEnded = true;
			$scope.messageEnd = {message: "You lost!!", cls: 'warning'};
		});
		
	});
}]);