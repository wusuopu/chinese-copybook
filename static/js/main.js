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
      <div className="text-stroke" style={{width: size, height: size}}>
        <svg viewBox={viewBox} style={{width: size, height: size}}>
          <g transform={this.props.transform}>
            {paths}
          </g>
        </svg>
      </div>
    )
  }
}
// ================================================================================
class Main extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      latticeSize: 300,
      showStep: true,
      strokeItems: [],
      strokeSteps: [],
      transform: 'translate(0, 36.9140625) scale(0.041015625, -0.041015625)',
      textWidth: 42,
      textHeight: 42,
      currentTextIndex: 0,
    }
  }
  render () {
    return (
      <div className="flex col">
        <div className="toolbar row">
          <button onClick={() => { this.setState({showStep: !this.state.showStep}) }}>显示笔顺</button>
          <button onClick={() => { this.setState({latticeSize: this.state.latticeSize + 5}) }}>+</button>
          <button onClick={() => { this.setState({latticeSize: this.state.latticeSize - 5}) }}>-</button>
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
    if (_.isEmpty(this.state.strokeItems[this.state.currentTextIndex])) {
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
    return (
      <div className="flex col center mb20">
        <div className="flex row">
          <Lattice size={this.state.latticeSize}>
            <TextStroke
              color="#555555"
              size={this.state.latticeSize}
              textWidth={this.state.textWidth}
              textHeight={this.state.textHeight}
              transform={this.state.transform}
              paths={this.state.strokeItems[this.state.currentTextIndex]}
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
    if (_.isEmpty(this.state.strokeItems)) {
      return null
    }
    let data = []
    let size = 48
    _.map(this.state.strokeItems, (item, index) => {
      data.push(
        <div key={index} className="p5 cursor" onClick={() => {this.setState({currentTextIndex: index})}}>
          <Lattice size={size}>
            <TextStroke
              color="#555555"
              size={size}
              textWidth={this.state.textWidth}
              textHeight={this.state.textHeight}
              transform={this.state.transform}
              paths={item}
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
  handleUpdate = (text) => {
    let strokeItems = []
    _.each(text, (t) => {
      let code = t.charCodeAt(0).toString(16)
      let items = ALL_DATA[code]
      if (_.isEmpty(items)) { return }
      strokeItems.push(items)
    })

    this.setState({
      strokeItems,
    })
  }
}

ReactDOM.render(
  <Main />,
  document.getElementById('app_root')
);
