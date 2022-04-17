package main

import (
	"database/sql"
	"fmt"
	"html/template"
	"net/http"

	_ "github.com/go-sql-driver/mysql"
)

var db *sql.DB
var err error
var btemp *template.Template

func init() {
	db, err = sql.Open("mysql", "root:@tcp(127.0.0.1:3306)/bloodtest")
	if err != nil {
		fmt.Println(err.Error())
	}
	//	defer db.Close()
	fmt.Println("db connection succesful")
}

type user struct {
	ID                          int
	Name, Email, Address, Phone string
}

func main() {

	http.HandleFunc("/", home)
	http.HandleFunc("/signup", signup)
	http.HandleFunc("/signin", signin)
	http.HandleFunc("/registered", register)
	http.Handle("/resources/", http.StripPrefix("/resources/", http.FileServer(http.Dir("../asset"))))
	//	http.Handle("/resources2/", http.StripPrefix("/resources2/", http.FileServer(http.Dir("../node_modules"))))
	http.ListenAndServe(":8040", nil)
	//fmt.Println("welcome")

}
func home(w http.ResponseWriter, r *http.Request) {

	qs := "select FirstName,email from `users`"
	rows, err := db.Query(qs)
	if err != nil {
		panic(err.Error())
	}
	defer rows.Close()
	var users []user
	for rows.Next() {
		var u user
		if err := rows.Scan(&u.Name, &u.Email); err != nil {
			fmt.Println(err)
		}
		users = append(users, u)
		//fmt.Printf("id %d name is %s\n", id, name)
		//	fmt.Fprintf(w, "user name:%s email:%s \n", fname, email)
	}

	//fmt.Fprintf(w, `welcome to blood bank`)
	btemp, err = template.ParseFiles("templates/base.gohtml")

	btemp.Execute(w, users)

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
func register(w http.ResponseWriter, r *http.Request) {
	fname := r.FormValue("fname")
	lname := r.FormValue("lname")
	email := r.FormValue("email")
	pass := r.FormValue("password")
	//display in command line
	//fmt.Println(fname,lname,email,pass)
	//display as response in browser
	//fmt.Fprintf(w, `succesfully registered name:%s email:%s pass:%s`, name, email, pass)
	//get value via loop
	// r.ParseForm()
	// for k, v := range r.Form {

	// 	fmt.Println(k,":",v)
	// }
	// fmt.Fprintln(w, `succesfully registered`)

	//inser into db
	qs := "INSERT INTO `users` (`FirstName`,`LastName`, `Email`, `Password`) VALUES ('%s', '%s', '%s','%s');"
	sql := fmt.Sprintf(qs, fname, lname, email, pass)
	//fmt.Println(sql)
	insert, err := db.Query(sql)
	if err != nil {
		panic(err.Error())
	}
	defer insert.Close()
	fmt.Fprintln(w, `succesfully registered`)

}
