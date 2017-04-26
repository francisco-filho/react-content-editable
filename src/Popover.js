import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup' // ES6

class PopoverContent extends Component {
  render(){
    const { title, onClose, position, description } = this.props
    return <div className={`popover ${position || 'auto'}`}>
      <div className="header">
        { title && <h1 className="title">{ title }
          { onClose && <i className="fa fa-close close" onClick={e => onClose(e) }/>}</h1>
        }
        { description && <p>{description}</p> }
      </div>

      <div className="content">
        { this.props.children }
      </div>
    </div>
  }
}

export default class Popover extends Component {
  constructor(){
    super()
    this.state = { open: false, position: 'auto' }
    this.onClickOutside = this.onClickOutside.bind(this)
  }
  componentDidMount(){
    document.addEventListener('click', this.onClickOutside);
    this.setState({open: this.props.open || false})
  }

  componentWillUnmount(){
    document.removeEventListener('click', this.onClickOutside);
  }

  componentWillReceiveProps(newProps){
    if (typeof newProps.open !== 'undefined' && newProps.open !== this.state.open)
      this.setState({open: newProps.open, position: newProps.position || 'auto'})
  }

  onClickOutside(e){
    if (!this.state.open) return;

    const container = ReactDOM.findDOMNode(this.refs.container);
    const content = ReactDOM.findDOMNode(this.refs.content);

    if (container.contains(e.target))  return;

    if (!container || !container.contains(e.target)) {
      e.preventDefault()
      e.stopPropagation()
      this.setState({open: false})
    }
  }

  toggleOpen(e){
    const { open, position } = this.state
    const containerLink = ReactDOM.findDOMNode(this.refs.containerLink);
    let newPosition = position

    if (!open && position === 'auto'){
      if (containerLink.getBoundingClientRect().left < 100){
        newPosition = 'left'
      }
      if (containerLink.getBoundingClientRect().right > (document.body.clientWidth - 100)) {
        newPosition = 'right'
      }
    }

    if ((!containerLink.contains(e.target)) && open) return;

    this.setState({open: !open, position: newPosition})
  }

  handleClose(e){
    const {onClose} = this.props
    this.setState({open: false})
    onClose && onClose(e)
  }

  render(){
    const { title, component, description } = this.props
    const { open, position } = this.state
    const el = React.cloneElement(component, {
      ref: 'containerLink',
      className: 'popover-trigger ' + component.props.className || '',
      onClick: e => { this.toggleOpen(e) }})

    return (
      <div className={`popover-container ${open ?'active':''}`} ref='container'>
        {el}
        {
          open && <CSSTransitionGroup
            transitionName={`slide-${position}`}
            transitionAppear={true}
            transitionAppearTimeout={1000}
            transitionEnter={false}
            transitionLeave={false}
          ><PopoverContent
            ref={'content'}
            title={title}
            description={description}
            position={position}
            onClose={e => { this.handleClose(e) }}>
            <div style={{position: 'relative'}}>
            { this.props.children}
            </div>
          </PopoverContent>
          </CSSTransitionGroup>
        }
       </div>

    )
  }
}