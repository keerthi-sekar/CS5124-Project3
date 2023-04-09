let data, barchartA, barchartB, wordcloud;
let season_options = ["All Seasons"];
let episode_options = ["All Episodes"]
//season_number,episode_number,scene,character,dialogue 
d3.csv('data/dummy_data.csv')
.then(_data => {
  data = _data;

    data.forEach(d => {
      d.season_number = +d.season_number;
      d.episode_number = +d.episode_number;
      d.scene = +d.scene;
      d.character = d.character;
      d.dialogue = d.dialogue;
    });

    console.log(data);

    data = data.sort(function (a,b) {return d3.ascending(a.season_number, b.season_number);});
    data = data.sort(function (a,b) {return d3.ascending(a.episode_number, b.episode_number);});
    data = data.sort(function (a,b) {return d3.ascending(a.scene, b.scene);});

    var character_rollup = d3.rollups(data, v => v.length, d => d.character);
    var dialogue_rollup = d3.rollups(data, v => v.length, d => d.dialogue);
    var episode_rollup = d3.rollups(data, v => v.length, d => d.episode_number);
    var season_rollup = d3.rollups(data, v => v.length, d => d.season_number);

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

    barchartA = new Barchart({
			parentElement: '#chart1',
			xAxisTitle: 'Characters'
		  }, data, character_rollup);
		
		barchartA.updateVis();

    barchartB = new Barchart({
			parentElement: '#chart2',
			xAxisTitle: 'Episodes'
		  }, data, episode_rollup);
		
		barchartB.updateVis();

    wordcloud = new WordCloud({
      parentElement: '#chart4'
    }, dialogue_rollup)
    wordcloud.initVis();
 
  })
  .catch(error => console.error(error));

 /*  d3.select("#seasonDropDown").on("change", function(d) {
    // recover the option that has been chosen
    selectedOption = d3.select(this).property("value");

  }) */

