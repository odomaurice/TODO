            require("dotenv").config();
            const express = require("express");
            const bodyParser = require("body-parser");
            const ejs = require("ejs");
            const mongoose = require("mongoose");
            const _ = require("lodash");

            const app = express();
            
            // let items = ["Buy Milk", "Cook Food", "Study"];
            // let workItems = [];

            app.set("view engine", "ejs");
            app.use(bodyParser.urlencoded({extended:true}));
            app.use(express.static("public"));
            
            mongoose.connect("mongodb+srv://admin-maurice:Reverend01$@cluster2022.hacnv3s.mongodb.net/todoDB", {useNewUrlParser:true});

            const itemsSchema = {
                name : String
            };

            const Item = mongoose.model("Item", itemsSchema);

            const item1 = new Item({
              name: "Welcome to your todolist",
            });

            const item2 = new Item({
              name: "Hit the + to add a new item",
            });

            const item3 = new Item({
              name: "Click the checkbox to delete",
            });

            const defaultItems = [item1, item2, item3];

            const listSchema = {
                name : String,
                items : [itemsSchema]
            };

            const List = mongoose.model("List", listSchema);

           

            app.get("/", (req,res) => {

                let weekdays = [
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ];
                let today = new Date();
                let options = {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                };

                let day = today.toLocaleDateString("en-US", options);


                Item.find({}, (err, foundItems) => {
                    if (foundItems.length === 0) {
                         Item.insertMany(defaultItems, (err) => {
                           if(err) {
                           console.error(err);
                           } else {
                           console.log("Items added successfully to database.")
                           }
                        });
                        res.redirect("/");
                      } else {
                        res.render("index", {listTitle: "Today", newListItems: foundItems});
                      }
                });

                
               
            });

            app.get("/:customList", (req, res) => {

                const customList = _.capitalize(req.params.customList);


                List.findOne({name:customList}, (err, foundList) => {
                      if(!err){
                       if(!foundList){

                const list = new List({
                    name: customList,
                    items: defaultItems,
                });
                list.save();
                res.redirect("/" + customList);

                } else{
                res.render("index", {listTitle: foundList.name, newListItems: foundList.items});

                 }
               }
             });

        });

            app.post("/", (req, res) => {
                const itemName = req.body.newItem;
                const listName = req.body.list;


                const item = new Item({
                    name: itemName
                });

                  if (listName === "Today") {
                    item.save();
                    res.redirect("/");
                  } else {
                    List.findOne({ name: listName }, function (err, foundList) {
                      foundList.items.push(item);
                      foundList.save();
                      res.redirect("/" + listName);
                    });
                  }

                
            });

            app.post("/delete", (req, res) => {
               const checkedItemId = req.body.checkbox;
               const listName = req.body.listName;

               if (listName === "Today") {
                 Item.findByIdAndRemove(checkedItemId,  err => {
                   if (err) {
                     console.log(err);
                   } else {
                     console.log("Item successfully removed");
                     res.redirect("/");
                   }
                 });
               } else {
                 List.findOneAndUpdate(
                   { name: listName },
                   { $pull: { items: { _id: checkedItemId } } },
                    (err, foundList) => {
                     if (!err) {
                       res.redirect("/" + listName);
                     }
                   }
                 );
               }

            });

            app.get("/work",  (req, res) => {
            res.render("index", {
                listTitle: "Work List",
                newListItems: workItems,
                route: "/work",
            });
            });


            let port = process.env.PORT;
            if (port == null || port == "") {
              port = 3000;
            }

            app.listen(port,  () => {
              console.log("Server listening on port " + port);
            });
