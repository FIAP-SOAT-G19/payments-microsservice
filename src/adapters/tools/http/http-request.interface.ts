export interface HttpRequest {
  post: (url: string, headers: any, data: any) => Promise<any>
}
