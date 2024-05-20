import { HttpRequest } from './http-request.interface'

export class NodeFetchAdapter implements HttpRequest {
  async post (url: string, headers: any, data: any): Promise<any> {
    try {
      const response = await fetch('http://'+url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers
      })

      return response.json()
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async get (url: string, headers: any): Promise<any> {
    try {
      const response = await fetch('https://'+url, {
        method: 'GET',
        headers
      })
      console.log(response)

      return response.json()
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async delete (url: string, headers: any): Promise<any> {
    try {
      await fetch(url, {
        method: 'DELETE',
        headers
      })
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}
