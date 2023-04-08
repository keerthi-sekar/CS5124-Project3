let data;
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

  })
  .catch(error => console.error(error));