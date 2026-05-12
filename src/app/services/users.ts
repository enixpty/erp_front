import { inject, Injectable } from '@angular/core';
import { environment } from '@src/environments/environment';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
const baseUrl = environment.apiUrl
@Injectable({
  providedIn: 'root',
})

export class UserServices {
  
  private http = inject(HttpClient);
    get_users(params: any):Observable<any>{  
        let httpParams = new HttpParams();
   
        for (const key in params) { 
          if(key =='filters' && params[key] !== null ){
              httpParams = httpParams.set(key, JSON.stringify(params[key]));
          }else{
            httpParams = httpParams.set(key, params[key]);
          }
          
        } 
        return this.http.get<any>(`${ baseUrl }/api/security/users/get_users/`,
           { params: httpParams }).pipe(
                map(resp =>{ 
                  return resp
                }), 
                //catchError((error:any) =>  console.log(error))
            )
    }

    up_user(params:any): Observable<any>{ 
      return this.http.put(`${ baseUrl }/api/security/users/update_user/`, { params: params })
    }
    
    del_user(obj:any):Observable<any>{
      let params = new HttpParams().set('id', obj);
      return this.http.delete(`${ baseUrl }/api/security/users/delete_user/`, { params: params })
      .pipe(
        map(resp=> { return resp })
      )
    } 
    create_user(params:any): Observable<any>{ 
      return this.http.post(`${ baseUrl }/api/security/users/register/`, { params: params })
    }
}
