import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class App extends Component {
  constructor(){
    super()
    this.state = {
      active: false,
      editing: false,
      editingItem: false,
      data: ['um', 'dois', 'tres', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez']
    }
  }

  handleChangeMode(status, i){
    if (status === 'editing'){
      this.setState({editingItem: i})
    }
    if (status == 'stopped')
      this.setState({editingItem: false})
  }

  handleRemove(i){
    const {data} = this.state
    this.setState({data: [
      ...data.slice(0, i),
      ...data.slice(i+1)
    ]})
    console.log('removing...')
  }

  handleSave(e, i){
    const {data} = this.state
    this.setState({data: [
      ...data.slice(0, i),
      e,
      ...data.slice(i+1)
    ]})
    console.log('saving...')
  }

  render(){
    const {editing, active, data, editingItem} = this.state
    return <div>
        <div className="tooltips">
          <h1>Tooltips</h1>
          <p>Estilos para tooltips</p>
          <div style={{position: 'relative'}}>
            <a data-tooltip="from data-text hello my friend, i am centered" style={{marginLeft: '200px'}}>Save</a>
          </div>
        </div>

      <div  className="main">

      <h1 onClick={ e => this.setState({active: !active})}>React!</h1>
      {
        data.map( (d,i) => {
          return <div className="btn" key={i}>
            <i className="fa fa-calendar"/>
            <ContentEditable
              active={active && (!editingItem || editingItem === i)}
              newItem={d === 'Novo Item'}
              onSave={ e => this.handleSave(e, i) }
              onCancel={ e => console.log('canceling...') }
              onRemove={ e => this.handleRemove(i) }
              onChangeMode={status => this.handleChangeMode(status, i)}
            >
              <span className="x">{d}</span>
            </ContentEditable>
          </div>
        })
      }
      { active && !editingItem && <i className="fa fa-plus"
          onClick={e => {
            const data = [...this.state.data, 'Novo Item']
            this.setState({data})
            console.log('adding')
          }}/>
      }
    </div>
    </div>
  }
}

class ContentEditable extends Component {
  static get defaultProps(){
    return {
      onSave: null,
      onCancel: null,
      onChangeMode: null,
      newItem: false
    }
  }

  static get propTypes(){
    return {
      onSave: PropTypes.func.isRequired,
      onCancel: PropTypes.func.isRequired
    }
  }

  constructor(){
    super()
    this.state = { editing: false, active: true, value: null}
    this.colar = this.colar.bind(this)
  }

  componentDidMount(){
    if(this.props.newItem){
      this.editar()
    }
  }

  componentWillReceiveProps(newProps){
    if (newProps.children != this.props.children){
      this.setState({value: this.props.children})
    }
  }

  colar(e){
    e.preventDefault()
  }

  editar(){
    const editor = this.refs.editor
    this.setState({
      editing: true,
      value: editor.innerHTML
    })
    editor.addEventListener('paste', this.colar)
    setTimeout(()=> {
      const length = editor.innerHTML.length
      editor.focus()
      this.posicionarCursorNoFinal(editor, length)
    },0)

    this.props.onChangeMode && this.props.onChangeMode('editing')
  }

  posicionarCursorNoFinal(editor, pos){
    const sel = window.getSelection()
    const range = document.createRange()
    range.setStart(editor.childNodes[0], pos)
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)
  }

  sairDoModoEdicao(){
    this.setState({editing: false})
    this.refs.editor.removeEventListener('paste', this.colar)
    this.props.onChangeMode && this.props.onChangeMode('stopped')
  }

  handleSave(e){
    const { onSave } = this.props
    this.setState({value: this.refs.editor.innerHTML})
    onSave && onSave( this.refs.editor.innerHTML)
    this.sairDoModoEdicao()
  }

  handleCancel(e){
    const { value } = this.state
    const { onCancel } = this.props
    this.setState({value: value})
    onCancel && onCancel()
    this.refs.editor.innerHTML = value
    this.sairDoModoEdicao()
  }

  render(){
    const { editing, value} = this.state
    const { onRemove, active } = this.props
    const c = this.props.children,
          el = React.cloneElement(c, {ref: 'editor', contentEditable: editing, className:'edit ' + c.props.className, value})

    return (
      active ? <div className={`content-editable ${editing ? 'editing' : ''}`}
                  ref={ div => this.div = div }
                  suppressContentEditableWarning={true}>
          { c && el }
          { editing && <div className="actions">
            <i className="fa fa-check" onClick={ e => { this.handleSave(e)}}/>
            <i className="fa fa-close" onClick={ e => { this.handleCancel(e, value) }}/>
          </div> }
          { active && !editing  && <i className="fa fa-pencil edit-mode" onClick={ e => this.editar()} /> }
          { active && onRemove && !editing  && <i className="fa fa-trash" onClick={ e => onRemove(e) } /> }
      </div> : this.props.children
    )
  }
}

class ContainerEditable extends Component {
  render(){
    const { active } = this.props

    return active ?
      <div className="container-editable">
        { this.props.children }
        <div className="add">
          <i className="fa fa-plus"
              onAdd={e =>
                console.log('adding')
              }/>
        </div>
      </div> :  <div> { this.props.children }</div>
  }
}
