import fetchData from './fetchData.js'

const container = document.querySelector('.vis-container')

const movieDataURL =
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json'

const colors = [
  '#DA2C38',
  '#226F54',
  '#F4F0BB',
  '#87C38F',
  '#43291F',
  '#FFBFA0',
  '#97C8EB',
]

const displayVis = async () => {
  const movieData = await fetchData(movieDataURL)
  const h = container.getBoundingClientRect().height
  const w = container.getBoundingClientRect().width
  const padding = 70

  // TOOLTIP
  const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .attr('id', 'tooltip')
    .text('this is a tooltip')

  const root = d3.hierarchy(movieData).sum((d) => d.value)
  const treemapLayout = d3.treemap().size([w, h])
  treemapLayout(root)

  let categories = root
    .descendants()
    .map(({ data: { category } }) => category || 'Action')
  categories = [...new Set(categories)]
  console.log(categories)
  const categoriesScale = d3
    .scaleBand()
    .domain(categories)
    .range([0, categories.length])
  const svg = d3
    .select(container)
    .append('svg')
    .attr('height', h)
    .attr('width', w)
    .style('border', '0.3rem solid var(--myPrim)')
    .style('border-radius', '0.3rem')

  svg
    .selectAll('rect')
    .data(
      root.descendants((d) => {
        console.log(d)
      })
    )
    .enter()
    .append('rect')
    .attr('class', ({ depth }) => {
      if (depth === 2) {
        return 'tile'
      } else {
        return 'category'
      }
    })
    .attr('x', (d) => d.x0)
    .attr('y', (d) => d.y0)
    .attr('width', (d) => d.x1 - d.x0)
    .attr('height', (d) => d.y1 - d.y0)
    .attr('stroke', 'white')
    .attr('fill', ({ data: { category } }) => {
      return colors[categoriesScale(category)]
    })
    .attr('data-name', ({ data: { name } }) => name)
    .attr('data-category', ({ data: { category } }) => {
      return category
    })
    .attr('data-value', ({ data: { value } }) => {
      return value
    })
    .on('mouseover', (e) => {
      console.log(e.target)
      e.target.style.stroke = '#7389ae'
      const element = e.target.getBoundingClientRect()
      const tooltip = document.getElementById('tooltip')
      tooltip.style.left = `${element.right + 5}px`
      tooltip.style.top = `${element.bottom}px`
      tooltip.classList.add('active')
      tooltip.dataset.value = e.target.dataset.value
      tooltip.innerHTML = `<p>Name: ${e.target.dataset.name}</p><p>Category: ${e.target.dataset.category}</p><p>Value: ${e.target.dataset.value}</p>`
    })
    .on('mouseout', (e) => {
      e.target.style.stroke = ''
      const tooltip = document.getElementById('tooltip')
      tooltip.classList.remove('active')
    })
  // .attr('fill', ({ id }) => {
  //   const degree = educationData.find((item) => item.fips === id)[
  //     'bachelorsOrHigher'
  //   ]
  //   return colorScale(degree)
  // })

  svg
    .selectAll('text')
    .data(root.descendants())
    .enter()
    .append('text')
    .attr('x', (d) => d.x0 + 3)
    .attr('y', (d) => d.y0 + 15)
    .attr('width', (d) => d.x1 - d.x0)
    .text(({ depth, data: { name }, x1, x0 }) => {
      const width = Math.floor(x1 - x0)
      const maxChar = Math.floor(width / 10)
      if (depth === 2) {
        if (maxChar >= name.length) {
          return `${name}`
        }
        return `${name.substring(0, maxChar)}...`
      }
      return
    })
    .attr('class', 'tree-text')

  const legend = d3
    .select(container)
    .append('svg')
    .attr('id', 'legend')
    .attr('height', 30)
    .attr('width', 500)

  const legendScale = d3.scaleBand().domain(categories).range([0, 500])

  const legendAxis = d3.axisBottom(legendScale)
  legend.append('g').attr('transform', `translate(0, 10)`).call(legendAxis)

  legend
    .selectAll('rect')
    .data(categories)
    .enter()
    .append('rect')
    .attr('class', 'legend-item')
    .attr('height', 10)
    .attr('width', 500 / categories.length)
    .attr('x', (d, i) => {
      return (500 / categories.length) * i
    })
    .attr('fill', (d) => {
      return colors[categoriesScale(d)]
    })
}
export default displayVis
