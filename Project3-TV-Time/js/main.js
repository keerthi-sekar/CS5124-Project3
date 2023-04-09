let data, barchartA, barchartB, wordcloud;
let season_options = ["All Seasons"];
let episode_options = ["All Episodes"];
let cast = [];
//season,episode,character,line
d3.csv('data/script.csv')
.then(_data => {
  data = _data;

    data.forEach(d => {
        d.season = +d.season;
        d.episode = +d.episode;
        d.character = d.character;
        d.line = d.line;

        if(d.character == "Eleanor Shellstrop" || d.character == "Michael" || d.character == "Tahani Al-Jamil" ||
      d.character == "Janet" || d.character == "Jason Mendoza" || d.character == "Chidi Anagonye"
      || d.character == "Shawn" || d.character == "Simone Garnett" || d.character == "Derek Hofstetler" ||d.character == "Trevor")
      {
        var datapoint = {
          'Season': d.season,
          'Episode': d.episode,
          'Character': d.character,
          'Line': d.line
        }
        cast.push(datapoint);
      }
    });

    console.log(cast);

    cast = cast.sort(function (a,b) {return d3.ascending(a.Season, b.Season);});
    cast = cast.sort(function (a,b) {return d3.ascending(a.Episode, b.Episode);});
    //cast = cast.sort(function (a,b) {return d3.ascending(a.scene, b.scene);});

    var character_rollup = d3.rollups(cast, v => v.length, d => d.Character);
    var line_rollup = d3.rollups(data, v => v.length, d => d.character);
    var episode_rollup = d3.rollups(cast, v => v.length, d => d.Episode);
    var season_rollup = d3.rollups(cast, v => v.length, d => d.Season);
    console.log('cast', line_rollup);

    season_rollup.forEach(v => {
      season_options.push("Season " + v[0]);
    })

    season_options.sort();

    episode_rollup.forEach(v => {
      episode_options.push("Episode " + v[0]);
    })

    episode_options.sort();

    var selectSeason = document.getElementById("seasonDropDown");

    for(var i = 0; i < season_options.length; i++) {
        var opt = season_options[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        selectSeason.appendChild(el);
    }
    
    var selectEpisode = document.getElementById("episodeDropDown");

    for(var i = 0; i < episode_options.length; i++) {
        var opt = episode_options[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        selectEpisode.appendChild(el);
    }

    var window_width = window.innerWidth;
    barchartA = new Barchart({
			parentElement: '#chart1',
			//xAxisTitle: 'Characters'
		  }, data, character_rollup, window_width / 2 - 50);
		
		barchartA.updateVis();

    barchartB = new Barchart({
			parentElement: '#chart2',
			//xAxisTitle: 'Episodes'
		  }, data, episode_rollup, window_width / 2 - 50);
		
		barchartB.updateVis();

    /* wordcloud = new WordCloud({
      parentElement: '#chart4'
    }, line_rollup)
    wordcloud.initVis(); */
 
  })
  .catch(error => console.error(error));

 /*  d3.select("#seasonDropDown").on("change", function(d) {
    // recover the option that has been chosen
    selectedOption = d3.select(this).property("value");

  }) */

