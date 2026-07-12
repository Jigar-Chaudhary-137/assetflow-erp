# Types: Pagination

## Purpose
Defines the standard pagination pattern used for all list endpoints in AssetFlow. Every API endpoint that returns a collection of records must support pagination query parameters and return a paginated response envelope.

---

## Query Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `integer` | `1` | The page number to retrieve (1-indexed) |
| `limit` | `integer` | `20` | Number of items per page (max: `100`) |
| `sort` | `string` | `createdAt` | Field to sort by |
| `order` | `string` | `desc` | Sort direction: `asc` or `desc` |
| `search` | `string` | — | Optional search term (applied to relevant text fields) |

### Example Request
```
GET /api/assets?page=2&limit=10&sort=name&order=asc&search=macbook
```

---

## Paginated Response Shape

```json
{
  "success": true,
  "message": "Assets retrieved successfully",
  "data": {
    "results": [],
    "pagination": {
      "currentPage": 2,
      "totalPages": 5,
      "totalItems": 48,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": true
    }
  }
}
```

### `pagination` Object Fields

| Field | Type | Description |
| :--- | :--- | :--- |
| `currentPage` | `integer` | The currently returned page number |
| `totalPages` | `integer` | Total number of pages available |
| `totalItems` | `integer` | Total count of matching records in the database |
| `itemsPerPage` | `integer` | Number of items in the current response |
| `hasNextPage` | `boolean` | Whether a next page exists |
| `hasPrevPage` | `boolean` | Whether a previous page exists |

---

## Backend Implementation

```js
// utils/paginate.js
const paginate = async (Model, query = {}, options = {}) => {
  const page      = Math.max(1, parseInt(options.page)  || 1);
  const limit     = Math.min(100, parseInt(options.limit) || 20);
  const sortField = options.sort  || 'createdAt';
  const sortOrder = options.order === 'asc' ? 1 : -1;
  const skip      = (page - 1) * limit;

  const [results, totalItems] = await Promise.all([
    Model.find(query).sort({ [sortField]: sortOrder }).skip(skip).limit(limit),
    Model.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    results,
    pagination: {
      currentPage:  page,
      totalPages,
      totalItems,
      itemsPerPage: results.length,
      hasNextPage:  page < totalPages,
      hasPrevPage:  page > 1,
    },
  };
};

module.exports = paginate;

// Usage in a controller:
const data = await paginate(Asset, filterQuery, req.query);
return ApiResponse.success(res, data, 'Assets retrieved successfully');
```

---

## Frontend Usage (React)

```jsx
// hooks/usePagination.js
const usePagination = (fetchFn, params = {}) => {
  const [page, setPage]     = useState(1);
  const [data, setData]     = useState([]);
  const [meta, setMeta]     = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await fetchFn({ ...params, page });
      setData(res.data.results);
      setMeta(res.data.pagination);
      setLoading(false);
    };
    load();
  }, [page]);

  return { data, meta, page, setPage, loading };
};

// Component usage
const { data: assets, meta, page, setPage } = usePagination(assetService.getAll);

<Pagination
  currentPage={meta?.currentPage}
  totalPages={meta?.totalPages}
  onPageChange={setPage}
/>
```
