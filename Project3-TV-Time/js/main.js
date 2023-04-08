
//season_number,episode_number,scene_number,character,dialogue 
d3.csv('data/dummy_data.csv')
.then(data => {
    data.forEach(d => {
      d.season_number = +d.season_number;
      d.episode_number = +d.episode_number;
      d.scene_number = +scene_number;
      d.dialogue = d.dialogue;

    });
 
  })
  .catch(error => console.error(error));