let data, barchartA, barchartB, wordcloud, character_rollup, episode_rollup, forceDirectedGraph;
let selectedOption = "All Seasons"
let season_options = ["All Seasons"];
// let episode_options = ["All Episodes"];
let episodeFilter = [];
let characterFilter = [];
let cast = [];
let words = [];
let count = 0;
let searchPhrase = "";

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
          d.character == "Janet" || d.character == "Jason Mendoza" || d.character == "Chidi Anagonye" || 
          d.character == "Shawn" || d.character == "Simone Garnett" || d.character == "Derek Hofstetler" || d.character == "Trevor" ||
          d.character == "Mindy St. Claire" || d.character == "Doug Forcett" || d.character == "Judge")
      {
        var datapoint = {
          'season': d.season,
          'episode': d.episode,
          'character': d.character,
          'line': d.line
        }

        cast.push(datapoint);

      }
    });

    console.log('words', words);
    console.log('cast', cast);

    cast = cast.sort(function (a,b) {return d3.ascending(a.Season, b.Season);});
    cast = cast.sort(function (a,b) {return d3.ascending(a.Episode, b.Episode);});
    //cast = cast.sort(function (a,b) {return d3.ascending(a.scene, b.scene);});

    character_rollup = d3.rollups(cast, v => v.length, d => d.character);
    character_rollup = character_rollup.sort(function(a, b){ return d3.descending(a[1], b[1]); })
    var line_rollup = d3.rollups(words, v => v.length, d => d);
    episode_rollup = d3.rollups(cast, v => v.length, d => d.episode);

    var season_rollup = d3.rollups(cast, v => v.length, d => d.season);

    season_rollup.forEach(v => {
      season_options.push("Season " + v[0]);
    })

    season_options.sort();

    var selectSeason = document.getElementById("seasonDropDown");

    for(var i = 0; i < season_options.length; i++) {
        var opt = season_options[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        selectSeason.appendChild(el);
    }

    var window_width = window.innerWidth;
    barchartA = new Barchart({
			parentElement: '#chart1',
			xAxisTitle: 'Characters'
		  }, data, character_rollup, 350);
		
		barchartA.updateVis();

    barchartB = new Barchart({
			parentElement: '#chart2',
			xAxisTitle: 'Episodes'
		  }, data, episode_rollup, 750);
		
		barchartB.updateVis();

    wordcloud = new WordCloud({
      parentElement: '#chart4'
    }, data)
    wordcloud.updateVis(data);

    var forceData = getForceDataJson(data);
    forceDirectedGraph = new ForceDirectedGraph({ parentElement: '#chart5'}, forceData, '#chart5');
 
  })
  .catch(error => console.error(error));

  // d3.json('data/thegoodplace.json').then(data => {
  //   console.log(data)
  //   const forceDirectedGraph = new ForceDirectedGraph({ parentElement: '#chart5'}, data, '#chart5');
  // })
  // .catch(error => console.error(error));

  // d3.json('data/miserables.json').then(data => {
  //   const forceDirectedGraph = new ForceDirectedGraph({ parentElement: '#chartexample'}, data, '#chartexample');
  // })
  // .catch(error => console.error(error));

  d3.select("#seasonDropDown").on("change", function(d) {
    // set the option that has been chosen
    selectedOption = d3.select(this).property("value");
    episodeFilter = [];
    characterFilter = [];
    filterData();
  })

  function onSearch(val) {
    searchPhrase = val;
    filterData();
  }

  function clearFilters() {
    episodeFilter = [];
    characterFilter = [];
    selectedOption = "All Seasons"
    document.getElementById("seasonDropDown").value = "All Seasons"
    searchPhrase = "";
    document.getElementById("phraseSearch").value = "";
    filterData();
  }

  function filterData() {
    var filteredData = cast;
    if (episodeFilter.length == 0 && characterFilter.length == 0 && selectedOption == "All Seasons" && searchPhrase == "") {
      console.log("remove filter")
      // Disable Remove Filter btn
      document.getElementById("btn").disabled = true
    }
    else {
      // Enable Remove Filter btn
      document.getElementById("btn").disabled = false;
      // filter by season if applicable
      if(selectedOption != "All Seasons") {
        var seasonNum = selectedOption.substring(7,8)
        filteredData = filteredData.filter(v => v.season == seasonNum)
        console.log(filteredData)
      }
      // Apply episode filter if applicable
      episodeFilter.forEach(episodeNum => {
        filteredData = filteredData.filter(v => v.episode == episodeNum)
      })

      // Apply character filter if applicable
      characterFilter.forEach(charName => {
        filteredData = filteredData.filter(v => v.character == charName)
      })
      console.log(filteredData)
    }
    if(searchPhrase != "") {
      var phraseData = [];
      filteredData.forEach(val => {
        if(val.line.toLowerCase().includes(searchPhrase.toLowerCase())) {
          phraseData.push(val)
        }
      })
      if(phraseData.length != 0) {
        filteredData = phraseData;
      }
      else {
        document.getElementById("phraseSearch").value = "";
        searchPhrase = "";
        alert("Phrase not found");
      }
    }
    var character_rollup_tmp = d3.rollups(filteredData, v => v.length, d => d.character);
    character_rollup_tmp = character_rollup_tmp.sort(function(a, b){ return d3.descending(a[1], b[1]); })
    var episode_rollup_tmp = d3.rollups(filteredData, v => v.length, d => d.episode);

    barchartA.num_map = character_rollup_tmp;
    barchartB.num_map = episode_rollup_tmp;

    barchartA.bars.remove();
    barchartA.updateVis();

    barchartB.bars.remove();
    barchartB.updateVis();

    wordcloud.updateVis(filteredData);

    var forceData = getForceDataJson(filteredData);
    forceDirectedGraph.nodes.remove();
    forceDirectedGraph.links.remove();
    forceDirectedGraph.data = forceData;
    forceDirectedGraph.updateVis();
  }

  function getForceDataJson(localData) {
    var chars = ["Eleanor", "Michael", "Tahani", "Janet", "Jason", "Chidi", "Shawn", "Simone", "Derek", "Trevor", "Mindy", "Doug", "Judge", "Bad Janet"]
    var relations = [];
    localData.forEach(val => {
      chars.forEach(char => {
        if(val.character.includes(char)) {
          const containsString = chars.find(str => val.line.includes(str));
          if(containsString && !containsString.includes(char)) {
            var objectToUpdate = relations.find(obj => obj.source === char && obj.target === containsString);
            if(!objectToUpdate) {
              objectToUpdate = relations.find(obj => obj.source === containsString && obj.target === char);
            }
            if(objectToUpdate) {
              objectToUpdate.value = objectToUpdate.value + 1
            }
            else {
              var obj = {"source": char, "target": containsString, "value": 1}
              relations.push(obj)
            }
          }
        }
      })
    })

    if(relations.length > 1) {
      const maxIdObject = relations.reduce((acc, curr) => {
        return acc.value > curr.value ? acc : curr;
      });
      console.log(maxIdObject.value)
      if(maxIdObject.value > 200) {
        relations = relations.filter(obj => obj.value > 15);
      }
      else if(maxIdObject.value > 80) {
        relations = relations.filter(obj => obj.value > 10);
      }
      else if(maxIdObject.value > 40) {
        relations = relations.filter(obj => obj.value > 5);
      }
    }
    

    var nodes = [];

     if (relations.find(obj => obj.source === "Eleanor" || obj.target === "Eleanor")) nodes.push({"id": "Eleanor", "group": 1})
     if (relations.find(obj => obj.source === "Chidi" || obj.target === "Chidi")) nodes.push({"id": "Chidi", "group": 1})
     if (relations.find(obj => obj.source === "Tahani" || obj.target === "Tahani")) nodes.push({"id": "Tahani", "group": 1})
     if (relations.find(obj => obj.source === "Jason" || obj.target === "Jason")) nodes.push({"id": "Jason", "group": 1})
     if (relations.find(obj => obj.source === "Michael" || obj.target === "Michael")) nodes.push({"id": "Michael", "group": 2})
     if (relations.find(obj => obj.source === "Janet" || obj.target === "Janet")) nodes.push({"id": "Janet", "group": 2})
     if (relations.find(obj => obj.source === "Shawn" || obj.target === "Shawn")) nodes.push({"id": "Shawn", "group": 2})
     if (relations.find(obj => obj.source === "Trevor" || obj.target === "Trevor")) nodes.push({"id": "Trevor", "group": 3})
     if (relations.find(obj => obj.source === "Simone" || obj.target === "Simone")) nodes.push({"id": "Simone", "group": 4})
     if (relations.find(obj => obj.source === "Derek" || obj.target === "Derek")) nodes.push({"id": "Derek", "group": 5})
     if (relations.find(obj => obj.source === "Mindy" || obj.target === "Mindy")) nodes.push({"id": "Mindy", "group": 5})
     if (relations.find(obj => obj.source === "Doug" || obj.target === "Doug")) nodes.push({"id": "Doug", "group": 6})
     if (relations.find(obj => obj.source === "Judge" || obj.target === "Judge")) nodes.push({"id": "Judge", "group": 6})

    var jsonData = {
      "nodes": nodes,
      "links": relations
    }
    return jsonData;

  }
