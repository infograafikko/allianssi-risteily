	//Save variable information for FB Share
	var urlHost = "https://infograafikko.github.io/allianssi-risteily/";
	var desc;
	var pic;
	var status;
	var pointsDif;

	//make variable for saving all reader's answers
	var answerList = [];

	//List of all questions
	var questionList = ["allime2", "allime3", "allime4", "allime5", "allime6", "allime7", "allime8", "allime9", "allime10"]

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyA3tM2C7zDae_kSubqF9WuRFjGN36LrfGw",
    authDomain: "how-many-a37b0.firebaseapp.com",
    databaseURL: "https://how-many-a37b0.firebaseio.com/",
    storageBucket: "how-many-a37b0.appspot.com",
    messagingSenderId: "996659641777"
  };
  firebase.initializeApp(config);

    var firebaseRef = firebase.database().ref();

  //Facebook share script
	//window.fbAsyncInit = function() {
	//	FB.init({
	//	appId            : '995003690647677',
	//	autoLogAppEvents : true,
	//	xfbml            : true,
	//	version          : 'v2.9'
	//	});
	//	FB.AppEvents.logPageView();
	//};

	(function(d, s, id){
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) {return;}
		js = d.createElement(s); js.id = id;
		js.src = "//connect.facebook.net/en_US/sdk.js";
		fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));


//function to call quiz module
function callEverything(qID, right, yAnswer1, yAnswer2, rAnswer1, rAnswer2, rAnswer3, source, pikscale, bufferwidth, bufferheight, xMarginPic, pik) {

	//Database setup

	var childData = [];

    var query = firebase.database().ref(qID).orderByKey();
	query.once("value")
	  .then(function(snapshot) {
	    snapshot.forEach(function(childSnapshot) {
	      // childData will be the actual contents of the child
	      var childValue = childSnapshot.val();
	      childData.push(childValue);
 	 });
	});

	var leftMargin = 50;

	//SVG Setup
	var svg = d3.select("svg." + qID),
	    margin = {right: 50, left: leftMargin, top: 10, bottom: 150},
	    width = +svg.attr("width") - margin.left - margin.right,
	    height = +svg.attr("height") - margin.top - margin.bottom;

	var guessPos;
	var rightPos;
	var bins;

	var x = d3.scaleLinear()
	    .domain([0, 100])
	    .range([0, width])
	    .clamp(true);

	var slider = svg.append("g")
	    .attr("class", "slider")
	    .attr("transform", "translate(" + margin.left + "," + height / 4 + ")");


	//define default guess is 50
	var guessData = [50];

	//Implement slider
	slider.append("line")
	    .attr("class", "track")
	    .attr("x1", x.range()[0])
	    .attr("x2", x.range()[1])
	  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
	    .attr("class", "track-inset")
	  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
	    .attr("class", "track-overlay")
	    .call(d3.drag()
	        .on("start.interrupt", function() { slider.interrupt(); })
	        .on("drag", function() { hue(x.invert(d3.event.x)); }));

	slider.insert("g", ".track-overlay")
	    .attr("class", "ticks")
	    .attr("transform", "translate(0," + 18 + ")")
	  .selectAll("text")
	  .data(x.ticks(1))
	  .enter().append("text")
	    .attr("x", x)
	    .attr("text-anchor", "middle")
	    .text(function(d) { return d; })
	    .attr("font-family", "Roboto");

	var numberTextGuess = svg.append("text").attr("class", "numberTextGuess");
	var numberTextRight = svg.append("text").attr("class", "numberTextRight");;


	var handle = slider.insert("circle", ".track-overlay")
	    .attr("class", "handle")
	    .attr("r", 9);

slider.transition() // Gratuitous intro!
   .duration(0)
   .tween("hue", function() {
    var i = d3.interpolate(0, 50);
     return function(t) { hue(i(t)); };
   });

	// Pictogram setup

	function piktogram() {
    	//define an icon store it in svg <defs> elements as a reusable component - this geometry can be generated from Inkscape, Illustrator or similar
	    svg.append("defs")
	    	.append("g")
	    	.attr("transform", "scale("+pikscale+")")
	   		.attr("id","iconCustom."+qID)
	        .append("path")
	        .attr("d",pik)

		//specify the number of columns and rows for pictogram layout
	    var numCols = 20;
	    var numRows = 5;

	    //padding for the grid
	    var xPadding = xMarginPic;
	    var yPadding = 160;

	    //horizontal and vertical spacing between the icons
	    var hBuffer = bufferheight;
	    var wBuffer = bufferwidth;

		//generate a d3 range for the total number of required elements
		var myIndex = d3.range(numCols*numRows);

		//Append pictograms
	 	svg.append("g")
	        .attr("class","pictoLayer")
	        .selectAll("use")
	        .data(myIndex)
	        .enter()
	        .append("use")
	            .attr("xlink:href","#iconCustom." + qID)
	            .attr("class",function(d)    {
	                return "icon"+d;
	            })
	            .attr("x",function(d) {
	                var remainder=d % numCols;//calculates the x position (column number) using modulus
	                return xPadding+(remainder*wBuffer);//apply the buffer and return value
	                })
	            .attr("y",function(d) {
	                var whole=Math.floor(d/numCols)//calculates the y position (row number)
	                return yPadding+(whole*hBuffer);//apply the buffer and return the value
	                })
	                .classed("iconPlain",true);

	    svg.append("g")
	        .attr("class","pictoLayer")
	        .selectAll("use")
	        .data(myIndex)
	        .enter()
	        .append("use")
	            .attr("xlink:href","#iconCustom." + qID)
	            .attr("class",function(d)    {
	                return "icon"+d;
	            })
	            .attr("x",function(d) {
	                var remainder=d % numCols;//calculates the x position (column number) using modulus
	                return xPadding+(remainder*wBuffer);//apply the buffer and return value
	            })
	            .attr("y",function(d) {
	                var whole=Math.floor(d/numCols)//calculates the y position (row number)
	                return yPadding+(whole*hBuffer);//apply the buffer and return the value
	                })
	                .classed("iconPlain",true);

	    };

	piktogram();

	//Katso oikea vastaus button

	var buttonGroup = svg.append("g")
		.attr("class", "buttonGroup")
		.on("click", function() { return getResults();} );

	var button = buttonGroup.append("rect")
		.attr("class", "button")
		.attr("x", margin.left)
		.attr("y", height*0.4)
		.attr("width", width)
		.attr("height", 30)
		.attr("fill", "#1C438C")

	var buttonText = buttonGroup.append("text")
		.attr("class", "buttonText")
		.attr("pointer-events", "none")
		.attr("x", width/2 + 20)
		.attr("y", height*0.47)
		.text("Vastaa")
		.attr("font-family", "Roboto")
		.attr("fill", "#fff")


	//Save variables for guess Line, right line and circleRight.
	var compareLineGuess = svg.append("line")
		.attr("class", "compareLineGuess")

	var compareLineRight = svg.append("line")
		.attr("class", "compareLineRight")

	var circleRight = svg.append("circle")

		rightPos = x(right) + leftMargin;

	//Function is ran when user drags slider
	function hue(h) {
	  handle.attr("cx", x(h));
		//Save the position of slider as numeric value
	  guessData = Math.round(h);
	  guessPos = x(h);

		//Decide based on guessData whether piktogram is colored or gray
		svg.selectAll("use").attr("class",function(d, i){
	        if (d<guessData)  {
	            return "iconSelected";
	        } else {
	            return "iconPlain";
	        }
	        });

		 update(guessPos);

	}

	//Update numeric value over slider handle
	function update(j) {
		numberTextGuess
			.attr("x", j + leftMargin)
			.attr("y",height*0.12)
			.attr("text-anchor", "middle")
			.attr("font-family", "Roboto")
			.attr("font-size", "25px")
			.text(guessData);
	}

	//Function for getting results after clicking "Katso oikea vastaus"
	function getResults() {

		saveAnswerForProfile();
		callHist();
		dissapear();
		addRightAnswer();
		legendAndText();
		changeQvisibility();

		//Push data to database
		date = Date.now()
		firebaseRef.child(qID + "/" + date).set(guessData);


	}

	//Save the guessed number for Profile after the test
	function saveAnswerForProfile(){

		var difference;

			//Count the difference between guess and right answer
			difference = Math.abs(guessData - right);

		answerList.push(difference)
		console.log(answerList); 
	}

	//Push character results if it's the last question
	function pushCharacterResult() {
		if (final)
		var sum = answerList.reduce(function(a, b) { return a + b; }, 0);
		console.log(sum);
	} 

	//make a histogram setup
	function callHist() {

		var formatPercent = d3.format(".0%");

		var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")
			.attr("class", "histogram");

		var xHist = d3.scaleLinear()
			.domain([0,100])
			.rangeRound([0, width])

		//Create 20 bins for histograms
		bins = d3.histogram()
			.domain(xHist.domain())
			.thresholds(xHist.ticks(20))
			(childData);

		//The height of histogram
		var yHist = d3.scaleLinear()
			.domain([0, d3.max(bins, function(d) { return d.length; })])
			.range([height, height*0.3]);

		//Label axis on the left of the chart
		var pctHist = d3.scaleLinear()
			.domain([0, d3.max(bins, function(d) { return d.length / childData.length; })])
			.range([height, height*0.3]);

		var bar = g.selectAll(".bar")
		  .data(bins)
		  .enter().append("g")
		    .attr("class", "bar")
		    .attr("transform", function(d) { return "translate(" + xHist(d.x0) + "," + yHist(d.length) + ")"; });

		bar.append("rect")
		    .attr("x", 1)
		    .attr("width", xHist(bins[0].x1) - xHist(bins[0].x0) - 1)
		    .attr("height", function(d) { return height - yHist(d.length); })
		    .style("opacity", 0.67);

		//bar.append("text")
		//    .attr("dy", ".75em")
		//    .attr("y", 6)
		//    .attr("x", (xHist(bins[0].x1) - xHist(bins[0].x0)) / 2)
		//    .attr("text-anchor", "middle")
		//    .text(function(d) { return d.length; });


		g.append("g")
			.attr("class", "axisy")
			.call(d3.axisLeft(pctHist)
				.tickFormat(formatPercent)
				.ticks(3)
				.tickSizeInner([-width])
				.tickSizeOuter(0)
				)

		//Remove "0%" from the histogram label
		g.selectAll(".tick")
	    .each(function (d, i) {
	        if ( d == 0 ) {
	            this.remove();
	        }
	    });

	    g.append("g")
		    .attr("class", "axisx")
		    .attr("transform", "translate(0," + height + ")")
		    .call(d3.axisBottom(xHist))


		//Transition
		svg.selectAll(".histogram")
			.style("opacity", 0.0)
			.transition()
			.duration(300)
			.style("opacity", 1);

	}

	function addRightAnswer() {

		//Add right answer with the text and the line using transition
		circleRight
			.attr("class", "circleRight")
			.attr("cx", rightPos)
			.attr("cy", height/4)
			.transition()
			.duration(300)
			.attr("r", 9)

		numberTextRight
			.attr("x", rightPos)
			.attr("y",height*0.12)
			.attr("text-anchor", "middle")
			.attr("font-family", "Roboto")
			.attr("font-size", "25px")
			.text(right);

		compareLineRight
			.attr("x1", rightPos)
			.attr("y1", height/4)
			.attr("x2", rightPos)
			.attr("y2", height/4)
			.attr("stroke-width", 2)
			.style("stroke-dasharray", ("3,3"))
			.attr("stroke", "#E67338")
			.transition()
			.duration(300)
			.attr("x2", rightPos)
			.attr("y2", height + margin.top);

		//Make comparison line visible
		compareLineGuess
			.attr("x1", guessPos + leftMargin)
			.attr("y1", height/4)
			.attr("x2", guessPos + leftMargin)
			.attr("y2", height/4)
			.attr("stroke-width", 2)
			.style("stroke-dasharray", ("3,3"))
			.attr("stroke", "#1C438C")
			.transition()
			.duration(300)
			.attr("x2", guessPos + leftMargin)
			.attr("y2", height + margin.top);

		};

	function dissapear() {

		//Make a slider and handle dissapear after clicking "Katso oikea vastaus"
		svg.selectAll(".buttonGroup")
				.transition()
				.style("opacity", 0)
				.duration(300);

		svg.select(".track-inset")
			.transition()
			.style("opacity", 0)
			.duration(300);

		svg.select(".track-overlay")
			.transition()
			.style("visibility", "hidden")
			.duration(300);

		svg.select(".track")
			.transition()
			.style("visibility", "hidden")
			.duration(300);

		svg.select(".ticks")
			.transition()
			.style("opacity", 0)
			.duration(300);

		svg.select(".track-overlay")
			.on(".drag", null);

		svg.selectAll(".pictoLayer")
			.transition()
			.style("opacity", 0)
			.duration(450);


		};


	//Show legend of red and blue circle AND show explaining text

	function legendAndText() {

		//Vastauksesi

		svg.append("text")
			.attr("class", "iAmLegendGuess")
			.attr("x", width* 0.13)
			.attr("y", height * 1.25)
			.text("Vastauksesi")
			.attr("font-family", "Roboto")

		//Append yAnswer1
		svg.append("text")
			.attr("class", "explain-textGuess")
			.attr("x", width* 0.13)
			.attr("y", height * 1.35)
			.text(yAnswer1)
			.attr("font-family", "Roboto")
			.attr("font-weight", "lighter")
			.attr("font-size", "15px")


		//Append your guess and yAnswer2
		svg.append("text")
			.attr("class", "explain-textGuess")
			.attr("x", width* 0.13)
			.attr("y", height * 1.42)
			.text(guessData + yAnswer2)
			.attr("font-family", "Roboto")
			.attr("font-weight", "lighter")
			.attr("font-size", "15px")

		svg.append("circle")
			.attr("class", "explain-textGuess")
			.attr("cx", width * 0.1)
			.attr("cy", height * 1.23)
			.attr("r", 9)
			.style("fill", "#1C438C");


		//Oikea vastaus

		svg.append("text")
			.attr("class", "iAmLegendRight")
			.attr("x", width*0.6)
			.attr("y", height * 1.25)
			.text("Oikea vastaus")
			.attr("font-family", "Roboto")

		svg.append("text")
			.attr("class", "explain-textRight")
			.attr("x",width*0.6)
			.attr("y", height * 1.35)
			.text(rAnswer1)
			.attr("font-family", "Roboto")
			.attr("font-weight", "lighter")
			.attr("font-size", "15px")

		svg.append("text")
			.attr("class", "explain-textRight")
			.attr("x",width*0.6)
			.attr("y", height * 1.42)
			.text(rAnswer2 + right + rAnswer3)
			.attr("font-family", "Roboto")
			.attr("font-weight", "lighter")
			.attr("font-size", "15px")

		svg.append("circle")
			.attr("class", "explain-textRight")
			.attr("cx", width*0.57)
			.attr("cy", height * 1.23)
			.attr("r", 9)
			.style("fill", "#E67338");

		// Histogram text

		svg.append("text")
			.attr("class","explain-text")
			.attr("x", width*0.89)
			.attr("y", height*0.45)
			.text("Muiden lukijoiden vastaukset")
			.attr("font-family", "Roboto")
			.attr("font-size", "10px")
			.attr("fill", "gray")

		//Source text

		svg.append("a")
			.attr("xlink:href", source)
			.attr("target", "_blank")
			.append("text")
			.attr("class", "source")
			.attr("x", width*0.13)
			.attr("y", height* 1.53)
			.text("Lähde")
			.attr("font-family", "Roboto")
			.attr("font-size", "15px")
			.attr("fill", "#1C438C")

		//Text transition

		svg.selectAll(".explain-text")
			.style("opacity", 0)
			.transition()
			.duration(300)
			.style("opacity", 1);

		svg.selectAll(".iAmLegend")
			.style("opacity", 0)
			.transition()
			.duration(300)
			.style("opacity", 1);
	}

	//Append questions when questionare goes forward
	function changeQvisibility() {

		if (questionList.length > 0) {
			//Take invisible class off to show the question
			var elements = document.getElementsByClassName(questionList[0]);
			elements[0].classList.remove("invisible");
			//Remove the top question in the list
			questionList.shift();
		} else {
			//Give results for player
			pointsDif = answerList.reduce(function(a, b) { return a + b; }, 0);
			var sum = 100 - (pointsDif/10);
			sum = Math.round(sum);
			console.log(pointsDif);

			//Change content for h2 right%
			document.getElementsByClassName("vastauksesi")[0].innerHTML = "Loistavaa! Tiesit " + sum + " % nuorten asioista."
			document.getElementsByClassName("vastauksesi")[1].innerHTML = "Erinomaista. Tiesit " + sum + " % nuorten asioista."
			document.getElementsByClassName("vastauksesi")[2].innerHTML = "Ei ihan nappiin. Tiesit testin mukaan " + sum + " % nuorten asioista."
			document.getElementsByClassName("vastauksesi")[3].innerHTML = "Äh! Tiesit testin mukaan " + sum + " % nuorten asioista."
			

			//Show character depencing of result
			if (sum >= 90) {
				var elements = document.getElementsByClassName("me-tietaja");
				elements[0].classList.remove("invisible");

				status = "Minä olen tähti";
				desc = "Tiesin " + sum + " % nuorten asioista. Me-säätiön 'Sadan nuoren Suomi' -pelissä sinäkin voit testata, miten hyvin tunnet Suomen nuoret.";
				pic = "img/tietaja.jpg";

			} else if (sum < 90 & sum >=75) {
				var elements = document.getElementsByClassName("me-keskiverto");
				elements[0].classList.remove("invisible");

				status = "Olen kartalla";
				desc = "Tiesin " + sum + " % nuorten asioista. Me-säätiön 'Sadan nuoren Suomi' -pelissä sinäkin voit testata, miten hyvin tunnet Suomen nuoret.";
				pic = "img/kartta.jpg";

			} else if (sum < 75 & sum >=50) {
				var elements = document.getElementsByClassName("me-alle");
				elements[0].classList.remove("invisible");

				status = "Meni metsään";
				desc = "Tiesin " + sum + " % nuorten asioista. Me-säätiön 'Sadan nuoren Suomi' -pelissä sinäkin voit testata, miten hyvin tunnet Suomen nuoret.";
				pic = "img/metsa.jpg";

			}  else {
				var elements = document.getElementsByClassName("me-kupla");
				elements[0].classList.remove("invisible")

				status = "Elän kuplassa";
				desc = "Tiesin " + sum + " % nuorten asioista. Me-säätiön 'Sadan nuoren Suomi' -pelissä sinäkin voit testata, miten hyvin tunnet Suomen nuoret.";
				pic = "img/kupla.jpg";

			}

			//Show sendMail
			var elements = document.getElementsByClassName("me-sendMail");
			elements[0].classList.remove("invisible");

			//Show share button
			//elements = document.getElementsByClassName("me-share");
			//elements[0].classList.remove("invisible");

			//Show yhteistyo
			elements = document.getElementsByClassName("me-yhteistyo");
			elements[0].classList.remove("invisible");
		}

	}
}

function pushDataToBase() {
	var checkedRadio = document.querySelector('input[name="osallistuminen"]:checked').value;
	var emailAddress = document.getElementById("emailAddress").value;

	//Show kiitos
	var elements = document.getElementsByClassName("me-vastaus");
	elements[0].classList.remove("invisible");

	var buttonElement = document.getElementById("submitPoints");
	buttonElement.style.opacity = 0;

	date = Date.now()


	//Push data to database
	firebaseRef.child("allianssiristeily/" + date).set({
		email: emailAddress,
		group: checkedRadio,
		pointsSum: pointsDif
		}
	);
	
}

function shareThis() {
    FB.ui({
        method: 'share_open_graph',
        action_type: 'og.shares',
        action_properties: JSON.stringify({
            object : {
               'og:url': urlHost,
               'og:title': "Testasin tietoni Suomen nuorista",
               'og:description': desc,
               'og:image': urlHost + pic
            }
        })
})
};