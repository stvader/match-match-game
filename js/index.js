class Card {
    constructor(elem, shirt, id, gameContext) {
        this.elem = elem.children[0];        
        this.shirt = shirt;
        this.id = id;
        this.gameContext = gameContext;
        this.isOpen = false;
        this.isLocked = false;        
        this.elem.addEventListener('click', this, false);
        this.setImage();
    }

    handleEvent(e) {           
        if (this.isOpen || this.isLocked) return;
        this.isOpen = true;
        this.elem.classList.add('card-flipped');
        this.gameContext.checkCards(this);       
    }

    setImage() {
        this.elem.children[1].style.backgroundImage = `url(img/mafia_${this.shirt}/image_${this.id}.jpg)`;
    }

    lock() {
        this.isOpen = true;
        this.isLocked = true;
        this.elem.parentElement.classList.add('card-hidden');
    }

    reset() {
        this.isOpen = false;
        this.isLocked = false;
        this.elem.classList.remove('card-flipped');
    }
}

class Game {
    constructor(shirt, difficult, startGameContext) {
        this.shirt = shirt;
        this.difficult = difficult;
        this.startGameContext = startGameContext;
        this.gameCardsCollection = [];
        this.firstCheckedCard = null;
        this.counter = 0;
    }

    randomNum (n) {
        return Math.floor(Math.random() * n);
    }

    createCardImageArray() {
        const gameCardsImages = [];
        const choiceImages = [];
        const randomImages = [];
        let doubleCardsImages;
        for (let i=1; i<=12; i++) {
            let imageNum = String(i);
            if (imageNum.length < 2) imageNum = '0' + imageNum;
            gameCardsImages.push(imageNum);
        }
        
        for (let i=0; i<this.difficult/2; i++) {
            let index = this.randomNum(gameCardsImages.length);
            choiceImages.push(gameCardsImages.splice(index, 1)[0]);
        }

        doubleCardsImages = choiceImages.concat(choiceImages.slice());

        for (let i=0; i<this.difficult; i++) {
            let index = this.randomNum(doubleCardsImages.length);
            randomImages.push(doubleCardsImages.splice(index, 1)[0]);
        }

        return randomImages;
    }

    drawCards() {
        const colorArr = this.createCardImageArray();
        this.cardsBlock = document.createElement('div');
        this.cardsBlock.id = 'cardsBlock';/*maybe delete*/
        for (let i=0; i<this.difficult; i++) {
            let divCard = document.createElement('div');
            divCard.classList.add('card');
            let divShirt = document.createElement('div');
            divShirt.classList.add('card-shirt', `card-shirt--${this.shirt}`);
            divCard.appendChild(divShirt);
            let divImage = document.createElement('div');
            divImage.classList.add('card-image');           
            divCard.appendChild(divImage);
            let cardContainer = document.createElement('div');
            cardContainer.classList.add('card-container');
            cardContainer.appendChild(divCard);
            this.cardsBlock.appendChild(cardContainer);
            this.gameCardsCollection.push(new Card(cardContainer, this.shirt, colorArr[i], this)); 
        }
        let gameField = document.querySelector('#game-field');
        gameField.appendChild(this.cardsBlock);
    }

    checkCards(card) {
        if (!this.firstCheckedCard) {
           this.firstCheckedCard = card; 
           return;
        }

        let checkedCardOne = this.firstCheckedCard;
        let checkedCardTwo = card;

        this.counter++;

        if (checkedCardOne.id === checkedCardTwo.id) {
            setTimeout(() => {
                checkedCardOne.lock();
                checkedCardTwo.lock();
            }, 500);
            setTimeout(() => {
                this.checkCompletedGame();
            }, 2000);
        } else {
            setTimeout(() => {
                checkedCardOne.reset();
                checkedCardTwo.reset();
            }, 500)
        }
        
        this.firstCheckedCard = null;
    }

    checkCompletedGame() {        
        let isUnlocked = this.gameCardsCollection.find((item) => item.isLocked === false);
        if(!isUnlocked) {            
            this.startGameContext.finishGame();
        }
    }

    init() {
        this.drawCards();
    }
}

class GameStart {
    constructor() {
        this.shirt;
        this.diffcult;
        this.startBotton = document.querySelector('.js-btn-new-game');
        this.introBlock = document.querySelector('.js-intro');
        this.gameField = document.querySelector('#game-field');
        this.winWindow = document.querySelector('#win-window');
        this.overlay = document.querySelector('#overlay');
        this.continueBtn = document.querySelector('#btn-continue');
    }

   
    hideBlock(block) {
        if (!block.classList.contains('hide')) {
            block.classList.add('hide');
        }      
    }

    displayBlock(block) {
        if (block.classList.contains('hide')) {
            block.classList.remove('hide');
        }  
    }

    beginGame() {  
        if (this.game) {
            this.resetGame();
            return;
        }

        let skirtCollection = Array.from(document.querySelectorAll('input[name="choice-shirt"]'));
        let diffCollection = Array.from(document.querySelectorAll('input[name="choice-diff"]'));
        
        let checkShirt = skirtCollection.find((item) => item.checked);
        let checkDiff = diffCollection.find((item) => item.checked);

        if (!checkShirt || !checkDiff) return;

        this.shirt = Number(checkShirt.dataset.shirt);
        this.diffcult = Number(checkDiff.dataset.diff);

        this.hideBlock(this.introBlock);

        this.timerDiv = document.createElement('div');
        this.timerDiv.classList.add('timer');
        this.gameField.appendChild(this.timerDiv);

        let timerCountdown = 3;
        let timer = setInterval(() => {
            this.timerDiv.innerHTML = timerCountdown;
            timerCountdown--;
        }, 1000);

        setTimeout(() => {
            clearInterval(timer);
            this.timerDiv.remove();
            this.game = new Game(this.shirt, this.diffcult, this);/*maybe this not need*/
            this.game.init();        
        }, 5000);        
    }
    
    finishGame() {       
        if (this.game.cardsBlock) this.game.cardsBlock.remove();
        this.displayBlock(this.winWindow);
        this.displayBlock(this.overlay);
        document.querySelector('#attemt-count').innerHTML = this.game.counter;
    }

    resetGame() {
        this.game = null;
        this.displayBlock(this.introBlock);
        this.hideBlock(this.winWindow);
        this.hideBlock(this.overlay);
    }

    init() {
        this.startBotton.addEventListener('click', this.beginGame.bind(this), false);
        this.continueBtn.addEventListener('click', this.resetGame.bind(this), false); 
    }
}


const start = new GameStart;
start.init();
