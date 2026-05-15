import { inject, Injectable } from '@angular/core';
import { environment } from '@src/environments/environment';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
const baseUrl = environment.apiUrl
@Injectable({
  providedIn: 'root',
})

export class MenuServices {
    private http = inject(HttpClient);
    get_all_active(): Observable<any>{ 
        return this.http.get<any>(`${ baseUrl }/api/security/menus/get_all_active/`)
    }

    get_menus(params: any):Observable<any>{  
        let httpParams = new HttpParams();
    
        for (const key in params) { 
            if(key =='filters' && params[key] !== null ){
                httpParams = httpParams.set(key, JSON.stringify(params[key]));
            }else{
            httpParams = httpParams.set(key, params[key]);
            }
            
        } 
        return this.http.get<any>(`${ baseUrl }/api/security/menus/get_menu/`,
            { params: httpParams }).pipe(
                map(resp =>{ 
                    return resp
                }), 
                //catchError((error:any) =>  console.log(error))
            )
    }

    up_menu(params:any): Observable<any>{ 
        return this.http.put(`${ baseUrl }/api/security/menus/update_menu/`, { params: params })
    }
        
    del_menu(obj:any):Observable<any>{
        let params = new HttpParams().set('id', obj);
        return this.http.delete(`${ baseUrl }/api/security/menus/delete_menu/`, { params: params })
        .pipe(
            map(resp=> { return resp })
        )
    } 
    create_menu(params:any): Observable<any>{ 
        return this.http.post(`${ baseUrl }/api/security/menus/register/`, { params: params })
    } 
 
    get_menulist( ): Observable<any>{
        return this.http.get<any>(`${ baseUrl }/api/security/menus/menuList/`,
            ).pipe(
                map(resp =>{ 
                    return resp
                }), 
                //catchError((error:any) =>  console.log(error))
            )
    }

    get_menuxrole(obj:any ): Observable<any>{ 
        debugger
        let params = new HttpParams().set('id', obj.role_id);
        return this.http.get<any>(`${ baseUrl }/api/security/mxr/listroles/`,
            { params: params }).pipe(
                map(resp =>{
                    return resp
                }),
                //catchError((error:any) =>  console.log(error))
            )
    }

    assignmenu(params:any): Observable<any>{
        return this.http.post(`${ baseUrl }/api/security/mxr/assignmenu/`, { params: params } )
    }
}