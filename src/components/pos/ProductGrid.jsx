import ProductCard from './ProductCard'

const ProductGrid = ({ products, onAddToCart, variant = 'default' }) => (
  <div className={variant === 'terminal' ? 'grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(175px,1fr))]' : 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3'}>
    {products.map(product => (
      <ProductCard key={product.id} product={product} onAdd={onAddToCart} variant={variant} />
    ))}
  </div>
)

export default ProductGrid
