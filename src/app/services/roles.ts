import { inject, Injectable } from '@angular/core';
import { environment } from '@src/environments/environment';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
const baseUrl = environment.apiUrl
@Injectable({
  providedIn: 'root',
})

export class RolesServices {
    private http = inject(HttpClient);
    get_roles(params: any):Observable<any>{  
        let httpParams = new HttpParams();
    
        for (const key in params) { 
            if(key =='filters' && params[key] !== null ){
                httpParams = httpParams.set(key, JSON.stringify(params[key]));
            }else{
            httpParams = httpParams.set(key, params[key]);
            }
            
        } 
        return this.http.get<any>(`${ baseUrl }/api/security/roles/get_roles/`,
            { params: httpParams }).pipe(
                map(resp =>{ 
                    return resp
                }), 
                //catchError((error:any) =>  console.log(error))
            )
    }
    up_role(params:any): Observable<any>{ 
        return this.http.put(`${ baseUrl }/api/security/roles/update_role/`, { params: params })
    }
     
     del_role(obj:any):Observable<any>{
       let params = new HttpParams().set('id', obj);
       return this.http.delete(`${ baseUrl }/api/security/roles/delete_role/`, { params: params })
       .pipe(
         map(resp=> { return resp })
       )
     } 
     create_rol(params:any): Observable<any>{ 
       return this.http.post(`${ baseUrl }/api/security/roles/register/`, { params: params })
     }  
     
    get_roleslist():Observable<any>{  
       
        return this.http.get<any>(`${ baseUrl }/api/security/roles/get_roleslist/`,
            ).pipe(
                map(resp =>{ 
                    return resp
                }), 
                //catchError((error:any) =>  console.log(error))
            )
    }
}