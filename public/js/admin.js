// const fetchProducts = async () => {
//   try {
//     const res = await fetch('/admin/fetch-products');
//     const products = await res.json();

//     const productsTable = document.getElementById('all-products');

//     for (let product of products) {
//       const htmlData = `
//             <tr>
//                 <td>${product._id}</td>
//                 <td>${product.productName}</td>
//                 <td>${product.description}</td>
//                 <td>${product.sku}</td>
//                 <td>${product.price}</td>
//                 <td>${product.updatedAt}</td>
//             </tr>
//         `;

//       productsTable.append(htmlData);
//     }
//   } catch (err) {
//     console.log(err);
//   }
// };

// fetchProducts();
