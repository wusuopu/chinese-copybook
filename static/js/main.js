class TextInput extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      value: ''
    }
  }
  render () {
    return (
      <div className="flex col">
        <p>该程序收集整理了常用的几千个汉字的楷书字帖供练习使用。</p>
        <p>输入文字：</p>
        <textarea value={this.state.value} onChange={this.handleChange} />
        <div className="row">
          <button onClick={this.handleUpdate}>生成字帖</button>
        </div>
      </div>
    )
  }
  componentDidMount () {
    let value = localStorage.getItem('copybook:text') || ''
    this.setState({value}, () => {
      if (value) { this.handleUpdate() }
    })
  }
  handleChange = (ev) => {
    this.setState({value: ev.target.value})
  }
  handleUpdate = () => {
    let value = this.state.value.trim()
    this.props.onUpdate && this.props.onUpdate(value)
    localStorage.setItem('copybook:text', value)
  }
}
class Lattice extends React.Component {
  render () {
    let color = this.props.color || '#ff4242'
    let size = this.props.size || 48
    return (
      <div className="svglattice">
        <svg viewBox="0 0 96 96" style={{width: size, height: size}}>
          <path d="M0,48 L96,48 Z" fill="#fff" stroke={color} strokeWidth="1" strokeDasharray="2,5"></path>
          <path d="M48,0 L48,96 Z" fill="#fff" stroke={color} strokeWidth="1" strokeDasharray="2,5"></path>
        </svg>
        {this.props.children}
      </div>
    )
  }
}
class TextStroke extends React.Component {
  render () {
    let size = this.props.size || 48

    return (
      <div className={`text-stroke ${this.props.className}`} style={{width: size, height: size}}>
        {this.renderText()}
      </div>
    )
  }
  renderText () {
    if (this.props.svgUrl) {
      return (
        <img src={this.props.svgUrl} />
      )
    }

    let color = this.props.color || '#ff4242'
    let size = this.props.size || 48
    let { textWidth, textHeight } = this.props
    let viewBox = `0 0 ${textWidth} ${textHeight}`

    let paths = _.map(this.props.paths, (d, i) => {
      return (
        <path key={i} d={d} style={{fill: color}} className="transparencySvg" />
      )
    })
    return (
      <svg viewBox={viewBox} style={{width: size, height: size}}>
        <g transform={this.props.transform}>
          {paths}
        </g>
      </svg>
    )
  }
}
// ================================================================================
class Main extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      latticeSize: 300,
      showStep: false,
      strokeItems: [],    // 笔顺svg
      charCodes: [],
      transform: 'translate(0, 36.9140625) scale(0.041015625, -0.041015625)',
      textWidth: 42,
      textHeight: 42,
      currentTextIndex: 0,
      fontFamily: 'qfkt',
    }
  }
  render () {
    return (
      <div className="flex col">
        <div className="toolbar row">
          <select value={this.state.fontFamily} onChange={(ev) => {
            this.setState({fontFamily: ev.target.value})
          }}>
            <option value="qfkt">手写楷体</option>
            <option value="xingshu">华章行书</option>
            <option value="FZKTJW">楷体</option>
          </select>
          <button onClick={() => { this.setState({latticeSize: this.state.latticeSize + 5}) }}>+</button>
          <button onClick={() => { this.setState({latticeSize: this.state.latticeSize - 5}) }}>-</button>
          <button onClick={this.prevWord}>&lt;</button>
          <button onClick={this.nextWord}>&gt;</button>
        </div>

        <div className="mb20">
          {this.renderTextPreview()}
          {this.renderTextSummary()}
        </div>
        <TextInput onUpdate={this.handleUpdate} />
      </div>
    )
  }
  renderTextPreview () {
    let charCodes = _.filter(this.state.charCodes, (code) => {
      let sets = this.state.fontFamily === 'xingshu' ? ALL_XS_CHARS : ALL_KT_CHARS
      return sets[code]
    })
    let code = charCodes[this.state.currentTextIndex]
    if (_.isEmpty(charCodes) || !code) {
      return null
    }

    let data = []
    if (this.state.showStep) {
      let size = 80
      _.reduce(this.state.strokeItems[this.state.currentTextIndex], (ret, item, index) => {
        ret.push(item)
        data.push(
          <div key={index} className="p5 cursor">
            <Lattice size={size}>
              <TextStroke
                color="#9d9d9d"
                size={size}
                textWidth={this.state.textWidth}
                textHeight={this.state.textHeight}
                transform={this.state.transform}
                paths={_.concat([], ret)}
              />
            </Lattice>
          </div>
        )
        return ret
      }, [])
    }

    let svgUrl = `static/fonts-svg/${this.state.fontFamily}/${code}.svg`
    return (
      <div className="flex col center mb20">
        <div className="flex row">
          <Lattice size={this.state.latticeSize}>
            <TextStroke
              className={this.state.fontFamily}
              color="#555555"
              size={this.state.latticeSize}
              textWidth={this.state.textWidth}
              textHeight={this.state.textHeight}
              transform={this.state.transform}
              paths={this.state.strokeItems[this.state.currentTextIndex]}
              svgUrl={svgUrl}
            />
          </Lattice>
        </div>
        <div className="flex flex-wrap row">
          {data}
        </div>
      </div>
    )
  }
  renderTextSummary () {
    let charCodes = _.filter(this.state.charCodes, (code) => {
      let sets = this.state.fontFamily === 'xingshu' ? ALL_XS_CHARS : ALL_KT_CHARS
      return sets[code]
    })
    if (_.isEmpty(charCodes)) {
      return null
    }

    let data = []
    let size = 48
    _.map(charCodes, (code, index) => {
      let svgUrl = `static/fonts-svg/${this.state.fontFamily}/${code}.svg`
      data.push(
        <div key={index} className="p5 cursor" onClick={() => {this.setState({currentTextIndex: index})}}>
          <Lattice size={size}>
            <TextStroke
              className={this.state.fontFamily}
              color="#555555"
              size={size}
              textWidth={this.state.textWidth}
              textHeight={this.state.textHeight}
              transform={this.state.transform}
              svgUrl={svgUrl}
            />
          </Lattice>
        </div>
      )
    })
    return (
      <div className="flex flex-wrap row mb20">
        {data}
      </div>
    )
  }
  prevWord = () => {
    if (this.state.currentTextIndex > 0) {
      this.setState({currentTextIndex: this.state.currentTextIndex - 1})
    }
  }
  nextWord = () => {
    if (this.state.currentTextIndex < (this.state.strokeItems.length - 1)) {
      this.setState({currentTextIndex: this.state.currentTextIndex + 1})
    }
  }
  handleUpdate = (text) => {
    let charCodes = []
    _.each(text, (t) => {
      let code = t.charCodeAt(0).toString(16)
      charCodes.push(code)
    })
    this.setState({charCodes})
  }
}

ReactDOM.render(
  <Main />,
  document.getElementById('app_root')
);
