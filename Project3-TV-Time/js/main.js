let data, barchartA, barchartB, wordcloud;
let season_options = ["All Seasons"];
let episode_options = ["All Episodes"];
let cast = [];
let words = [];
let count = 0;

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

        /* if(count < 500)
        {
          des = d.line.replace('"', '');
          des = des.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
          des = des.toLowerCase();
          des = des.split(' ');
          for(let i = 0; i < unwanted_words.length; i++)
          {
            des = des.filter(f => f !== unwanted_words[i]);
          }
          words = words.concat(des);
          count++;
        } */

        cast.push(datapoint);

      }
    });

    console.log('words', words);
    console.log('cast', cast);

    cast = cast.sort(function (a,b) {return d3.ascending(a.Season, b.Season);});
    cast = cast.sort(function (a,b) {return d3.ascending(a.Episode, b.Episode);});
    //cast = cast.sort(function (a,b) {return d3.ascending(a.scene, b.scene);});

    var character_rollup = d3.rollups(cast, v => v.length, d => d.Character);
    var line_rollup = d3.rollups(words, v => v.length, d => d);
    var episode_rollup = d3.rollups(cast, v => v.length, d => d.Episode);
    var season_rollup = d3.rollups(cast, v => v.length, d => d.Season);

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

    wordcloud = new WordCloud({
      parentElement: '#chart4'
    }, data)
    wordcloud.updateVis(data);
 
  })
  .catch(error => console.error(error));

  d3.json('data/miserables.json').then(data => {
    const forceDirectedGraph = new ForceDirectedGraph({ parentElement: '#chart5'}, data);
  })
  .catch(error => console.error(error));