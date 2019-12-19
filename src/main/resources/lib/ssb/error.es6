export const NOT_FOUND = {
  status: 404,
  message: 'Content not found'
}

export const renderError = (error) => {
  return {
    body: error.message,
    contentType: 'text/html'
  }
}
