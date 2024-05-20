import { HttpRequest } from './http-request.interface'

export class NodeFetchAdapter implements HttpRequest {
  async post (url: string, headers: any, data: any): Promise<any> {
    try {
      const response = await fetch(url, {
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
      let responseClone: any
      const response = await fetch(url, {
        method: 'GET',
        headers
      }).then(function (response) {
        responseClone = response.clone()
        return response.json()
      }).then(function (data) {
        console.log(data)
      }, function (rejectionReason) { // 3
        console.log('Error parsing JSON from response:', rejectionReason, responseClone); // 4
        responseClone.text() // 5
      .then(function (bodyText: any) {
        console.log('Received the following instead of valid JSON:', bodyText); // 6
      });
    });

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
