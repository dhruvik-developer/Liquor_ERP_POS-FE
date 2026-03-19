import ProductCard from './ProductCard'

const ProductGrid = ({ products, onAddToCart }) => (
  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
    {products.map(product => (
      <ProductCard key={product.id} product={product} onAdd={onAddToCart} />
    ))}
  </div>
)

export default ProductGrid

