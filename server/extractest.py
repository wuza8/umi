import re

test_case = """
To create a Rust backend for a gardening blog application using the Actix-web framework, you'll need to set up a project and implement the specified endpoints. Below is a basic implementation that includes the required endpoints, JSON handling, error management, and logging.

First, ensure you have Rust and Cargo installed. Then, create a new Actix-web project:

```bash
cargo new gardening_blog
cd gardening_blog
```

Add the necessary dependencies to your `Cargo.toml`:

```toml
[dependencies]
actix-web = "4.0.0-beta.8"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
uuid = { version = "1.0", features = ["v4"] }
log = "0.4"
env_logger = "0.9"
```

Now, implement the main application in `src/main.rs`:

```rust
use actix_web::{web, App, HttpServer, HttpResponse, Responder, middleware::Logger};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use std::sync::Mutex;
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Clone)]
struct Article {
    id: Uuid,
    title: String,
    content: String,
    images: Option<Vec<String>>,
}

#[derive(Serialize, Deserialize, Clone)]
struct Comment {
    id: Uuid,
    content: String,
}

struct AppState {
    articles: Mutex<HashMap<Uuid, Article>>,
    comments: Mutex<HashMap<Uuid, Vec<Comment>>>,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();

    let app_state = web::Data::new(AppState {
        articles: Mutex::new(HashMap::new()),
        comments: Mutex::new(HashMap::new()),
    });

    HttpServer::new(move || {
        App::new()
            .app_data(app_state.clone())
            .wrap(Logger::default())
            .route("/articles", web::get().to(get_articles))
            .route("/articles/{id}", web::get().to(get_article))
            .route("/articles", web::post().to(create_article))
            .route("/articles/{id}", web::put().to(update_article))
            .route("/articles/{id}", web::delete().to(delete_article))
            .route("/articles/{id}/comments", web::post().to(add_comment))
            .route("/articles/{id}/comments", web::get().to(get_comments))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}

async fn get_articles(data: web::Data<AppState>) -> impl Responder {
    let articles = data.articles.lock().unwrap();
    let articles: Vec<&Article> = articles.values().collect();
    HttpResponse::Ok().json(articles)
}

async fn get_article(data: web::Data<AppState>, web::Path(id): web::Path<Uuid>) -> impl Responder {
    let articles = data.articles.lock().unwrap();
    if let Some(article) = articles.get(&id) {
        HttpResponse::Ok().json(article)
    } else {
        HttpResponse::NotFound().body("Article not found")
    }
}

async fn create_article(data: web::Data<AppState>, article: web::Json<Article>) -> impl Responder {
    let mut articles = data.articles.lock().unwrap();
    let new_article = Article {
        id: Uuid::new_v4(),
        title: article.title.clone(),
        content: article.content.clone(),
        images: article.images.clone(),
    };
    articles.insert(new_article.id, new_article.clone());
    HttpResponse::Created().json(new_article)
}

async fn update_article(data: web::Data<AppState>, web::Path(id): web::Path<Uuid>, article: web::Json<Article>) -> impl Responder {
    let mut articles = data.articles.lock().unwrap();
    if let Some(existing_article) = articles.get_mut(&id) {
        existing_article.title = article.title.clone();
        existing_article.content = article.content.clone();
        existing_article.images = article.images.clone();
        HttpResponse::Ok().json(existing_article.clone())
    } else {
        HttpResponse::NotFound().body("Article not found")
    }
}

async fn delete_article(data: web::Data<AppState>, web::Path(id): web::Path<Uuid>) -> impl Responder {
    let mut articles = data.articles.lock().unwrap();
    if articles.remove(&id).is_some() {
        HttpResponse::Ok().body("Article deleted")
    } else {
        HttpResponse::NotFound().body("Article not found")
    }
}

async fn add_comment(data: web::Data<AppState>, web::Path(id): web::Path<Uuid>, comment: web::Json<Comment>) -> impl Responder {
    let mut comments = data.comments.lock().unwrap();
    let new_comment = Comment {
        id: Uuid::new_v4(),
        content: comment.content.clone(),
    };

    comments.entry(id).or_insert_with(Vec::new).push(new_comment.clone());
    HttpResponse::Created().json(new_comment)
}

async fn get_comments(data: web::Data<AppState>, web::Path(id): web::Path<Uuid>) -> impl Responder {
    let comments = data.comments.lock().unwrap();
    if let Some(article_comments) = comments.get(&id) {
        HttpResponse::Ok().json(article_comments)
    } else {
        HttpResponse::NotFound().body("No comments found for this article")
    }
}
```

### Explanation

1. **Data Structures**: 
   - `Article` and `Comment` structs are defined with `Serialize` and `Deserialize` traits to handle JSON serialization and deserialization.
   - `AppState` struct holds the application state, including articles and comments, using `Mutex` for thread-safe access.

2. **Endpoints**:
   - **GET /articles**: Retrieves all articles.
   - **GET /articles/{id}**: Retrieves a specific article by ID.
   - **POST /articles**: Creates a new article. The article ID is generated using `Uuid`.
   - **PUT /articles/{id}**: Updates an existing article by ID.
   - **DELETE /articles/{id}**: Deletes an article by ID.
   - **POST /articles/{id}/comments**: Adds a comment to a specific article.
   - **GET /articles/{id}/comments**: Retrieves all comments for a specific article.

3. **Concurrency and State Management**:
   - The application state is managed using `Mutex` to ensure safe concurrent access to shared data.

4. **Logging**:
   - The `Logger` middleware is used to log each request, which helps in monitoring and debugging.

5. **Error Handling**:
   - Basic error handling is implemented using HTTP response codes like `404 Not Found` and `201 Created`.

6. **Running the Server**:
   - The server listens on `127.0.0.1:8080`. You can test the endpoints using tools like `curl` or Postman.

This setup provides a basic structure for a gardening blog application. You can expand it by adding more features, such as user authentication, more detailed error handling, and database integration for persistent storage.If you have any questions or need further assistance with the implementation, feel free to ask!
"""

def extract_all_code_blocks(response): 
    pattern = r"```(\w+)\n(.*?)```"
    return re.findall(pattern, response, re.DOTALL)



print(extract_all_code_blocks(test_case))