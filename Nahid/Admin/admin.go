package main

import (
	"fmt"
	"html/template"
	"net/http"
)

var err error
var temp *template.Template

func main() {
	temp, err = template.ParseGlob("../public/*.gohtml")
	if err != nil {
		fmt.Println(err.Error())
	}
	http.HandleFunc("/", home)

	http.Handle("/resources/", http.StripPrefix("/resources/", http.FileServer(http.Dir("../asset"))))
	http.Handle("/resources2/", http.StripPrefix("/resources2/", http.FileServer(http.Dir("../node_modules"))))
	http.ListenAndServe(":8040", nil)
	//fmt.Println("welcome")
	

}
func home(w http.ResponseWriter, r *http.Request) {
	//fmt.Fprintf(w, `welcome to blood bank`)
	temp.ExecuteTemplate(w, "index.gohtml", nil)

}
