import React, {Component} from 'react'

const Paginator = ({ currentPage, totalPages, onFirst, onLast, onNext, onPrevious, records }) => (
  <div className="paginator">
    <span className={`arrow first ${currentPage <= 1 && 'disabled'}`} onClick={onFirst}><i className="fa fa-angle-double-left"/></span>
    <span className={`arrow previous ${currentPage <= 1 && 'disabled'}`} onClick={onPrevious}><i className="fa fa-angle-left"/></span>
    <span className="status">{`${currentPage} de ${totalPages}`}</span><span className="records">( { records } registros )</span>
    <span className={`arrow next ${currentPage >= totalPages && 'disabled'}`} onClick={onNext}><i className="fa fa-angle-right"/></span>
    <span className={`arrow last ${currentPage >= totalPages && 'disabled'}`} onClick={onLast}><i className="fa fa-angle-double-right"/></span>
  </div>
)

class DataGrid extends Component {
  static get defaultProps(){
    return {
      schema: [],
      columns: [],
      data: [],
      defaultSort: null,
      currentPage: 1,
      filter: []
    }
  }

  constructor(){
    super()
    this.state = {
      data: [],
      sortedBy: -1,
      reversed: false,
      currentPage: 1,
      inputFilterValue: ''
    }
  }

  initComponent(){
    const { data, page, defaultSort } = this.props
    if (defaultSort  != null){
      const sorted = this.sort(data, defaultSort)
      this.setState({data: sorted.data, sortedBy: sorted.sortedBy, inputFilterValue: '', reversed: false })
    }
    else
      this.setState({data, currentPage: page ? page : this.props.currentPage, inputFilterValue: '', reversed: false})
  }

  componentDidMount(){
    this.initComponent()
  }

  getPage(data, page){
    const { pageSize, paginate } = this.props
    const from = (page * pageSize) - pageSize

    return paginate ? data.slice(from, from + pageSize) : data
  }

  getPages(){
    const pageCount = Math.ceil(this.props.data.length / this.props.pageSize)
    return Array
      .from(new Array(pageCount))
      .map((p, i) => i + 1)
  }

  setPage(page){
    if (page != this.state.currentPage)
      this.setState({currentPage: page})
  }

  firstPage(){
    const {currentPage} = this.state
    const totalPages = this.getPages().length

    if (currentPage > 1)
      this.setPage(1)
  }

  previousPage(){
    const {currentPage} = this.state
    const totalPages = this.getPages().length

    if (currentPage > 1)
      this.setPage(currentPage - 1)
  }

  nextPage(){
    const {currentPage} = this.state
    const totalPages = this.getPages().length

    if (currentPage < totalPages)
      this.setPage(currentPage + 1)
  }

  lastPage(){
    const {currentPage} = this.state
    const totalPages = this.getPages().length

    if (currentPage < totalPages)
      this.setPage(totalPages)
  }

  sort(data, columnName){
    const {sortedBy, reversed } = this.state
    const colIndex = this.props.columns.filter((c)=> c.name === columnName)[0].index

    let isReversed = colIndex === sortedBy && reversed

    const sorted = data.sort((f, l) => {
      return sortedBy !== colIndex ?
        this.compare(f[colIndex], l[colIndex]) :
        this.compare(f[colIndex], l[colIndex], !isReversed)
    })

    if (colIndex === sortedBy)
      isReversed = !isReversed

    return {data: sorted, sortedBy: colIndex, reversed: isReversed}
  }

  compare(f, l, reverse=false){
    if (typeof f === 'string'){
      if (reverse)
        return l.localeCompare(f, 'pt', {sensitivity: 'base', ignorePonctuation: true})

      return f.localeCompare(l, 'pt', {sensitivity: 'base', ignorePonctuation: true})
    }

    if (reverse)
      return f < l ? 1 : f === l ? 0 : -1

    return f > l ? 1 : f === l ? 0 : -1
  }

  sortByAndSetState(columnName){
    const {data} = this.state
    const sorted = this.sort(data, columnName)
    this.setState({data: sorted.data, sortedBy: sorted.sortedBy, reversed: sorted.reversed})
  }

  zip(columns, row){
    let c = {}
    this.props.schema.map((s,i) => {
      c[s] = row[i]
    })
    return c
  }

  filterData(value){
    const { filter } = this.props
    const idx = []
    filter.forEach( (c, i) => {
      const x = this.props.columns.filter((col)=> col.name === c)[0].index
      if (x > -1)
        idx.push(x)
    })

    const filteredData = this.props.data.filter(f => {
      return idx.some((i) => {
        return ((""+f[i]).toLowerCase()).includes(value.toLowerCase())
      })
    })

    this.setState({data: filteredData})
  }

  clearFilter(){
    this.initComponent()
  }

  applyFilter(value){
    if (value === '')
      this.clearFilter()
    else
      this.filterData(value)
  }

  isColumnSorted(col){
    return typeof col['sort'] === 'undefined' || col['sort'] === true
  }

  render(){
    const { columns, paginate, pageSize, filter } = this.props
    const { data, currentPage } = this.state

    let columnSchema = columns.map(c => c.name)
    .reduce((o, n) => {
      o[n] = null
      return o
    }, {})

    return (
      <div className="datagrid">
        <div className="header">
          {
            filter &&
            <div className="filter">
              <div className="input-container">
                <span><i className="fa fa-search"/></span>
                <input type="text" placeholder="Digite o termo a ser pesquisado e pressione ENTER" onKeyDown={ e => {
                  if (e.keyCode == 13) {
                    this.applyFilter(this.state.inputFilterValue)
                  }
                }} onChange={ e => {
                  this.setState({ inputFilterValue: e.target.value})
                }}/>
                <span className="btn apply-filter" onClick={ e => this.applyFilter(this.state.inputFilterValue) }>Filtrar</span>
                <span className="btn close" onClick={e => this.clearFilter() }><i className="fa fa-close"/></span>
              </div>
            </div>
          }
        {
          paginate && data.length > pageSize &&
            <Paginator
              records={data.length}
              currentPage={currentPage}
              totalPages={this.getPages().length}
              onFirst={ e => this.firstPage() }
              onPrevious={ e => this.previousPage() }
              onNext={ e => this.nextPage() }
              onLast={ e => this.lastPage() } />

        }
        </div>
        <table><thead><tr>
          {
            columns.map((th, i) => {
              return !th.hidden && <th key={i} onClick={ e => {
                this.sortByAndSetState(th.name)
                e.preventDefault()
                e.stopPropagation()
              }}>{ th.label ? th.label : th.name }
                  { this.isColumnSorted(th) && <i className={`fa
                ${th.index === this.state.sortedBy ? 'sort' : ''}
                ${this.state.reversed && th.index === this.state.sortedBy ? 'desc fa-caret-up' : 'fa-caret-down'}
                `}/> }
              </th>
            })
          }</tr>
          </thead>
          <tbody>
          {
            data && data.length > 0 ? this.getPage(data, currentPage).map((tr,i) => {
              return <tr key={i}>
                {
                  columns.map((td,y) => {
                    return !td.hidden && <td key={y}
                      className={`
                      ${td.index === this.state.sortedBy ? 'selected-col' : ''}
                      ${ td.className ? td.className : ''}
                      `}
                    >{
                      td.component ?
                        React.createElement(td.component, this.zip(columnSchema, tr)) :
                        tr[td.index]
                    }</td>
                  })
                }
              </tr>
            }) :
              <tr><td colSpan="100">Não existem dados para exibição</td></tr>
          }
          </tbody></table>
      </div>
    )
  }
}

export default DataGrid