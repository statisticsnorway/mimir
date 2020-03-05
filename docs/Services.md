# Services
## Municipality
## Dashboard
`Used to update, create or delete datasets based on dataqueries`

**GET** (should maybe be PUT?)  
Update all:
```javascript
{
    id: '*'
}
```
Update one:
```javascript
{
    id: 'some-dataquery-id'
}
```

Returns:
```javascript
{
    success: true || false,
    message: 'success or failure info',
    updates: [ 'list', 'of', 'updated', 'dataquery', 'ids' ]
}
```

**DELETE**  
Delete datasets for all dataqueries
```javascript
{
    id: '*'
}
```
Delete one dataset:
```javascript
{
    id: 'some-dataquery-id'
}
```
Returns:
```javascript
{
    success: true || false,
    message: 'success or failure info',
    updates: [ 'list', 'of', 'updated', 'dataquery', 'ids' ]
}
```

## Custom Selector Municipals