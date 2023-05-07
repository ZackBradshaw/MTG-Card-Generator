import React from "react";
import { getRandomInt } from "./Utility";

export interface BasicCard {
  name: string,
  manaCost: string,
  typeLine: string,
  type: string,
  text: string,
  rawOracleText: string,
  modifiedOracleText: string,
  power: number,
  toughness: number,
  colorIdentity: string
  pt: string,
  flavorText: string,
  rarity: string,
  imageUrl: string,
  userPrompt: string,
  explaination: string,
  funnyExplaination: string
}

enum ColorIdentity {
  White = "w",
  Blue = "u",
  Black = "b",
  Green = "g",
  Red = "r",
  Colorless = "c",
  Azorius = "uw",
  Dimir = "ub",
  Rakdos = "br",
  Gruul = "rg",
  Selesnya = "wg",
  Orzhov = "wb",
  Izzet = "ur",
  Golgari = "bg",
  Boros = "rw",
  Simic = "ug",
  ThreePlusColored = "mc",
  Unknown = "unknown",
}

enum CardType {
  Creature,
  Instant,
  Sorcery,
  Enchantment,
  Artifact,
  Land,
  Unknown
}

const manaTokens : string[] = ["{G}", "{W}", "{U}", "{B}", "{R}", "{0}", "{1}", "{2}", "{3}", 
"{4}", "{5}", "{6}", "{7}", "{8}", "{9}", "{10}", "{C}", "{T}", "{X}"]

const manaTokenToCssCharacter : Record<string, string> = {
  "{G}": "g",
  "{W}": "w",
  "{U}": "u",
  "{B}": "b",
  "{R}": "r",
  "{0}": "0",
  "{1}": "1",
  "{2}": "2",
  "{3}": "3",
  "{4}": "4",
  "{5}": "5",
  "{6}": "6",
  "{7}": "7",
  "{8}": "8",
  "{9}": "9",
  "{10}": "10",
  "{C}": "c",
  "{T}": "tap",
  "{X}": "x",
}

export class MagicCard {
  name: string
  manaCost: string
  typeLine: string
  type: string
  text: string
  rawOracleText: string
  modifiedOracleText: string
  power: number
  toughness: number
  _colorIdentity: string
  pt: string
  flavorText: string
  rarity: string
  imageUrl: string
  setNumberDisplay: string
  id: number
  userPrompt: string
  explaination: string
  funnyExplaination: string

  constructor(card: BasicCard) {
    this.name = card.name
    this.manaCost = card.manaCost
    this.type = card.type
    this.typeLine = card.typeLine
    this.text = card.text
    this.rawOracleText = card.rawOracleText
    this.modifiedOracleText = card.modifiedOracleText
    this.power = 0
    this.toughness = 0
    this._colorIdentity = ""
    this.flavorText = card.flavorText
    this.pt = card.pt
    this.rarity = card.rarity
    this.imageUrl = card.imageUrl
    this.setNumberDisplay = getRandomInt(0, 451) + "/" + 451
    this.id = getRandomInt(0, 1000000000)
    this.userPrompt = card.userPrompt
    this.explaination = card.explaination
    this.funnyExplaination = card.funnyExplaination
  }

  static clone(card: MagicCard): MagicCard {
    let newCard = new MagicCard(card)
    newCard.setNumberDisplay = card.setNumberDisplay
    newCard.id = card.id
    return newCard
  }

  get manaCostTokens(): string[] {
    return this.getManaCostTokens(this.manaCost);
  }

  private getManaCostTokens(tokensToParse: string): string[] {
    var r: RegExp = /\{(.*?)\}/g
    var match = tokensToParse.match(r)
    var manaCostTokens:string[] = []
    if (match) {
      match?.forEach(m => manaCostTokens.push(m))
    }
    return manaCostTokens;
  }

  get colorIdentity(): ColorIdentity {
    var white = false;
    var blue = false;
    var black = false;
    var red = false;
    var green = false;
  
    var manaCostTokens = this.manaCostTokens;
    if (!this.manaCostTokens) {
      return ColorIdentity.Unknown
    }
  
    if (manaCostTokens.includes("{W}")) { white = true }
    if (manaCostTokens.includes("{U}")) { blue = true }
    if (manaCostTokens.includes("{B}")) { black = true }
    if (manaCostTokens.includes("{R}")) { red = true }
    if (manaCostTokens.includes("{G}")) { green = true }
  
    if (white && !blue && !black && !red && !green) { return ColorIdentity.White }
    if (!white && blue && !black && !red && !green) { return ColorIdentity.Blue }
    if (!white && !blue && black && !red && !green) { return ColorIdentity.Black }
    if (!white && !blue && !black && red && !green) { return ColorIdentity.Red }
    if (!white && !blue && !black && !red && green) { return ColorIdentity.Green }
    if (!white && !blue && !black && !red && !green) { return ColorIdentity.Colorless }
  
    if (white && blue && !black && !red && !green) { return ColorIdentity.Azorius }
    if (!white && blue && black && !red && !green) { return ColorIdentity.Dimir }
    if (!white && !blue && black && red && !green) { return ColorIdentity.Rakdos }
    if (!white && !blue && !black && red && green) { return ColorIdentity.Gruul }
    if (white && !blue && !black && !red && green) { return ColorIdentity.Selesnya }
    if (white && !blue && black && !red && !green) { return ColorIdentity.Orzhov }
    if (!white && blue && !black && red && !green) { return ColorIdentity.Izzet }
    if (!white && !blue && black && !red && green) { return ColorIdentity.Golgari }
    if (white && !blue && !black && red && !green) { return ColorIdentity.Boros }
    if (!white && blue && !black && !red && green) { return ColorIdentity.Simic }
  
    return ColorIdentity.ThreePlusColored;
  }

  get cardDivClassName() {
    return `card-background card-background-${this.manaCssClassPostfix}`
  }

  get cardFrameTypeLineClassName()  {
    return `frame-type-line frame-${this.manaCssClassPostfix} frame-type-line-${this.manaCssClassPostfix}`
  }

  get cardFrameHeaderClassName() {
    return `frame-header frame-${this.manaCssClassPostfix} frame-header-${this.manaCssClassPostfix}`
  }

  get cardFrameTextBoxClassName() {
    return `frame-text-box frame-text-box-${this.id} frame-text-box-${this.manaCssClassPostfix} frame-margin`
  }

  get cardFrameContentClassName() {
    return `frame-text-box-inner frame-text-box-inner-${this.id}`
  }
  
  get cardFrameArtClassName() {
    return `frame-art frame-art-${this.manaCssClassPostfix} frame-margin`
  }

  get rarityDisplay() {
    var token = ""
    switch (this.rarity.toLocaleLowerCase()) {
      case "common": token = "C"; break;
      case "uncommon": token = "U"; break;
      case "rare": token = "R"; break;
      case "mythic": token = "M"; break;
      case "mythic rare": token = "M"; break;
    }
    return token;
  }

  get cardType(): CardType {
    var type = this.type.toLocaleLowerCase();
    if (type.includes("legendary creature") || type.includes("creature")) return CardType.Creature
    if (type == "instant") return CardType.Instant;
    if (type == "sorcery") return CardType.Sorcery;
    if (type.includes("artifact")) return CardType.Artifact;
    if (type.includes("enchantment")) return CardType.Enchantment;
    if (type.includes("land")) return CardType.Land;
    return CardType.Unknown;
  }

  get textDisplay() {
    return this.rawOracleText.split('\n').map(line => this.addManaHtmlToCardTextLine(line));
  }

  // Gets the CSS postfix to create class names that are differentiated by color identity.
  private get manaCssClassPostfix() {
    return this.colorIdentity;
  }

  // Transforms text representations of mana symbols from OpenAI into HTML that can render those mana symbols using the mana project (https://github.com/andrewgioia/mana).
  private addManaHtmlToCardTextLine(line: string) {
    manaTokens.forEach(token => {
      line = line.replaceAll(token, `<i class=\"${MagicCard.getManaClassName(token)}\"></i>`)
    })

    return line
  }

  // Gets the matching mana project (https://github.com/andrewgioia/mana) CSS token for <i></i> based on the mana token string.
  static getManaClassName(manaToken: string) {
    return `ms ms-${manaTokenToCssCharacter[manaToken]} ms-padding`
  }
  
  private getChildrenClientOffsetHeight(element: HTMLElement) {
    let height = 0;
    for (let i = 0; i < element.children.length; i++) {
      height += (element.children[i] as HTMLElement).offsetHeight;
    }
    return height;
  }

  // Adjust the size of the card's text box until it fits within the card.
  adjustFontSize() {
    const container : HTMLElement | null = document.querySelector(".frame-text-box-" + this.id)
    const innerContainer : HTMLElement | null = document.querySelector(".frame-text-box-inner-" + this.id)

    if (!container || !innerContainer) {
      return
    }

    // Increment or decrement the size of the text and flavor text containers until they fit within the card.
    // We do not edit the font size of the power and toughness frame because it should be uniform.
    let textContainer = innerContainer.children[0] as HTMLElement
    let flavorTextContainer = innerContainer.children[2] as HTMLElement

    const maxFontSize = 24
    const minFontSize = 5
    const heightOffset = 30
    let fontSize = parseInt(window.getComputedStyle(textContainer).fontSize)

    // Make the font size larger until it overflows the container.
    // Make larger first so we can shrink it one notch after.
    while (this.getChildrenClientOffsetHeight(innerContainer) < (container.clientHeight - heightOffset)) {

      fontSize += .5
      textContainer.style.fontSize = fontSize + 'px'
      flavorTextContainer.style.fontSize = fontSize + 'px'

      if (fontSize >= maxFontSize) {
        break
      }
    }

    // Make the font size smaller until it fits the container.
    while (this.getChildrenClientOffsetHeight(innerContainer) > (container.clientHeight - heightOffset)) {
      fontSize -= .5
      textContainer.style.fontSize = fontSize + 'px'
      flavorTextContainer.style.fontSize = fontSize + 'px'

      if (fontSize <= minFontSize) {
        break
      }
    }
  }
}

interface CardDisplayProps {
  card: MagicCard;
}

interface CardDisplayState {
  card: MagicCard;
  editMode: boolean;
  rawOracleTextUpdate: string;
  nameUpdate: string;
  typeUpdate : string;
  manaCostUpdate: string;
  powerAndToughnessUpdate: string;
}

export class CardDisplay extends React.Component<CardDisplayProps, CardDisplayState> {
  constructor(props: CardDisplayProps) {
    super(props);
    this.state = {
      card: props.card,
      editMode: false,
      nameUpdate: props.card.name,
      rawOracleTextUpdate: props.card.rawOracleText,
      typeUpdate: props.card.typeLine,
      manaCostUpdate: props.card.manaCost,
      powerAndToughnessUpdate: props.card.pt,
    };

    this.handleCardNameUpdate = this.handleCardNameUpdate.bind(this);
    this.handleCardOracleTextUpdate = this.handleCardOracleTextUpdate.bind(this);
    this.handleCardTypeUpdate = this.handleCardTypeUpdate.bind(this);
    this.handleCardManaCostUpdate = this.handleCardManaCostUpdate.bind(this);
    this.handleCardPowerAndToughnessUpdate = this.handleCardPowerAndToughnessUpdate.bind(this);
  }

  componentDidUpdate(prevProps: Readonly<CardDisplayProps>, prevState: Readonly<CardDisplayState>, snapshot?: any): void {
    if (this.state.card.rawOracleText != prevState.card.rawOracleText) {
      this.state.card.adjustFontSize()
    }
  }

  componentDidMount(): void {
    this.state.card.adjustFontSize()
  }

  handleCardNameUpdate(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ nameUpdate: event.target.value });
  }

  handleCardTypeUpdate(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ typeUpdate: event.target.value });
  }

  handleCardOracleTextUpdate(event: React.ChangeEvent<HTMLTextAreaElement>) {
    this.setState({ rawOracleTextUpdate: event.target.value });
  }

  handleCardManaCostUpdate(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ manaCostUpdate: event.target.value.trim() });
  }

  handleCardPowerAndToughnessUpdate(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ powerAndToughnessUpdate: event.target.value.trim() });
  }

  updateEditMode() {
    var updatedCard = MagicCard.clone(this.state.card)
    updatedCard.name = this.state.nameUpdate
    updatedCard.rawOracleText = this.state.rawOracleTextUpdate
    updatedCard.typeLine = this.state.typeUpdate
    updatedCard.manaCost = this.state.manaCostUpdate
    updatedCard.pt = this.state.powerAndToughnessUpdate
    this.setState({ editMode: !this.state.editMode, card: updatedCard })
  }

  render() {
    const card = this.state.card
    const oracleEditTextAreaRows = card.textDisplay.length * 3
    return (
      <div>
        <div className="card-container">
          <div className={card.cardDivClassName}>
            <div className="card-frame">
              <div className={card.cardFrameHeaderClassName}>
                <div className="name name-type-size">
                  {!this.state.editMode ?
                    <p>{card.name}</p> :
                    <input className="card-edit-name" type="text" value={this.state.nameUpdate} onChange={this.handleCardNameUpdate} />
                  }
                </div>
                {!this.state.editMode ?
                    <div className="mana-symbols">
                      {card.manaCostTokens.map((manaCostToken, i) => (
                        <i key={card.name + "-manaToken-"+ i} className={MagicCard.getManaClassName(manaCostToken) + " manaCost"} id="mana-icon"></i>
                      ))}
                    </div> :
                    <div className="card-edit-manaCost-container">
                      <input className="card-edit-manaCost" type="text" value={this.state.manaCostUpdate} onChange={this.handleCardManaCostUpdate} />
                    </div>
                }
              </div>
              <img className={card.cardFrameArtClassName} src={card.imageUrl} />
              <div className={card.cardFrameTypeLineClassName}>
                 {!this.state.editMode ?
                    <h1 className="type name-type-size">{card.typeLine}</h1> :
                    <input className="card-edit-type" type="text" value={this.state.typeUpdate} onChange={this.handleCardTypeUpdate} />
                  }
                <div className="mana-symbols">
                  <i className="ms ms-dfc-ignite" id="mana-icon"></i>
                </div>
              </div>
              <div className={card.cardFrameTextBoxClassName}>
                <div className={card.cardFrameContentClassName}>
                  <div className="description ftb-inner-margin">
                    {!this.state.editMode ?
                      <div>
                        {card.textDisplay.map((line, i) => (
                          <p key={card.name + "-text-" + i} dangerouslySetInnerHTML={{ __html: line }}></p>
                        ))}
                      </div> 
                      :
                      <textarea className="card-edit-text" value={this.state.rawOracleTextUpdate} rows={oracleEditTextAreaRows} onChange={this.handleCardOracleTextUpdate} />
                    }
                  </div>
                  <p className="description">
                  </p>
                  <p className="flavour-text">
                    {card.flavorText}
                  </p>
                  {card.pt &&
                    <div className="power-and-toughness-frame">
                      <div className="power-and-toughness power-and-toughness-size">
                        {!this.state.editMode ?
                          <div>{card.pt}</div> :
                          <input className="card-edit-pt" type="text" value={this.state.powerAndToughnessUpdate} onChange={this.handleCardPowerAndToughnessUpdate} />
                        }
                      </div>
                    </div>
                  }
                  </div>
              </div>
              <div className="frame-bottom-info inner-margin">
                <div className="fbi-left">
                  <p>{card.setNumberDisplay} {card.rarityDisplay}</p>
                  <p>OpenAI &#x2022; <img className="paintbrush" src="https://image.ibb.co/e2VxAS/paintbrush_white.png" alt="paintbrush icon" />Custom Magic</p>
                </div>
                <div className="fbi-center" onClick={(e) => { this.updateEditMode()}}></div>
                <div className="fbi-right">
                  &#x99; &amp; &#169; 2023 Chat GPT Turbo
                </div>
              </div>
            </div>
          </div>
        </div>
        {card.explaination && 
          <div>
            <h3 className="card-explaination-header">{card.name}</h3>
            <div className="card-meta card-explanation">
              The card <b>{card.name}</b> was generated based on the prompt.. 
              <br/>
              <br/>
              "<b><i>{card.userPrompt}</i></b>"
              <br/>
              <br/>
              {card.explaination}
              <br/>
              <br/>
              {card.funnyExplaination}
            </div>
          </div>
        }
      </div>
    )
  }
}