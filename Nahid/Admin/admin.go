package main

import (
	"fmt"
	"html/template"
	"net/http"
)

var err error
var btemp *template.Template

func main() {

	http.HandleFunc("/", home)
	http.HandleFunc("/signup", signup)
	http.HandleFunc("/signin", signin)
	http.Handle("/resources/", http.StripPrefix("/resources/", http.FileServer(http.Dir("../asset"))))
	//	http.Handle("/resources2/", http.StripPrefix("/resources2/", http.FileServer(http.Dir("../node_modules"))))
	http.ListenAndServe(":8040", nil)
	//fmt.Println("welcome")

}
func home(w http.ResponseWriter, r *http.Request) {
	//fmt.Fprintf(w, `welcome to blood bank`)
	btemp, err = template.ParseFiles("templates/base.gohtml")
	if err != nil {
		fmt.Println(err.Error())
	}

	btemp.Execute(w, nil)

}
func signup(w http.ResponseWriter, r *http.Request) {
	//fmt.Fprintf(w, `welcome to blood bank`)
	//btemp.ExecuteTemplate(w, "base.gohtml", nil)
	fmt.Println("signup")
	btemp, err = template.ParseFiles("templates/base.gohtml")
	if err != nil {
		fmt.Println(err.Error())
	}
	btemp, err = btemp.ParseFiles("webpage/signup.gohtml")
	if err != nil {
		fmt.Println(err.Error())
	}

	btemp.Execute(w, nil)

}
func signin(w http.ResponseWriter, r *http.Request) {
	//fmt.Fprintf(w, `welcome to blood bank`)
	//	btemp.ExecuteTemplate(w, "base.gohtml", nil)

	btemp, err = template.ParseFiles("templates/base.gohtml")
	if err != nil {
		fmt.Println(err.Error())
	}
	btemp, err = btemp.ParseFiles("webpage/signin.gohtml")
	if err != nil {
		fmt.Println(err.Error())
	}

	btemp.Execute(w, nil)

}
