let gamefieldNod = document.querySelector('.js-game-field');
gamefieldNod.innerHTML = `
  <div class='hi'><button>Hi</button></div>
`;

let btnNod = document.querySelector('.hi');
btnNod.addEventListener('click',()=>{
  console.log('ok');
});

//like this the event listener from btnNod is lost
// unless we use gamefieldNod.insertAdjacentHTML('beforeend', `
//<div class='bye'><button>Bye</button></div>`);
gamefieldNod.insertAdjacentHTML('beforeend', `
<div class='bye'><button>Bye</button></div>
`); 




