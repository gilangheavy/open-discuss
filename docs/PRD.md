Garuda Game (perusahaan fiktif) merupakan sebuah perusahaan paling sukses dalam menjalankan bisnis di bidang online game. Perusahaan tersebut memiliki ratusan game yang dimainkan oleh jutaan pengguna di seluruh dunia. Salah satu kunci keberhasilan Garuda Game adalah dekat dengan para pemainnya. Mereka berhasil membangun komunitas yang aktif.

Untuk menjaga kualitas layanan terhadap komunitas, Garuda Game berinisiatif untuk membangun aplikasi diskusi atau forum untuk para pemain. Dengan hadirnya platform diskusi yang resmi, para pemain akan sangat terbantu dan merasa nyaman untuk berdiskusi perihal game yang mereka mainkan. Aplikasi forum akan tersedia di platform web ataupun mobile native.

Garuda Game ingin aplikasi forum didesain secara matang. Seperti menerapkan automation testing, menerapkan clean architecture. Dengan begitu, aplikasi ini bisa terhindar dari bug, mudah beradaptasi pada perubahan teknologi, dan mudah untuk dikembangkan.

Untuk mencapai itu, Garuda Game menghadirkan talenta terbaik dalam membangun aplikasi forum. Salah satunya adalah Anda yang ditugaskan untuk membangun Back-End API guna mendukung fungsionalitas dari aplikasi Front-End.

Aplikasi forum dikembangkan secara bertahap dan saat ini diharapkan sudah memiliki fitur:

- Registrasi Pengguna;
- Login dan Logout;
- Menambahkan Thread;
- Melihat Thread;
- Menambahkan dan Menghapus Komentar pada Thread; serta
- Menambahkan dan Menghapus Balasan Komentar Thread (opsional).
- Menyukai dan Batal Menyukai Komentar (opsional).

# Kriteria Forum API

Terdapat 6 kriteria utama yang harus Anda penuhi dalam membuat proyek Forum API.

## Kriteria 1: Menambahkan Thread

API harus dapat menambahkan thread melalui route:

- Method: POST
- Path: /threads
- Body Request:

```
{
    "title": string,
    "body": string
}
```

Response yang harus dikembalikan:

- Status Code: 201
- Response Body:

```
{
    "status": "success",
    "data": {
        "addedThread": {
            "id": "thread-h_W1Plfpj0TY7wyT2PUPX",
            "title": "sebuah thread",
            "owner": "user-DWrT3pXe1hccYkV1eIAxS"
        }
    }
}

```

Ketentuan:

Menambahkan thread merupakan resource yang dibatasi (restrict). Untuk mengaksesnya membutuhkan access token guna mengetahui siapa yang membuat thread.
Jika properti body request tidak lengkap atau tidak sesuai, maka:
Kembalikan dengan status code 400; serta
Berikan body response: 
status: “fail”
message: Pesan apapun selama tidak kosong.

## Kriteria 2: Menambahkan Komentar pada Thread

API harus dapat menambahkan komentar pada thread melalui route:

- Method: POST
- Path: /threads/{threadId}/comments
- Body Request:

```
{
    "content": string
}
```

Response yang harus dikembalikan:

- Status Code: 201
- Response Body:

```
{
    "status": "success",
    "data": {
        "addedComment": {
            "id": "comment-_pby2_tmXV6bcvcdev8xk",
            "content": "sebuah comment",
            "owner": "user-CrkY5iAgOdMqv36bIvys2"
        }
    }
}
```

Ketentuan:

Menambahkan komentar pada thread merupakan resource yang dibatasi (restrict). Untuk mengaksesnya membutuhkan access token guna mengetahui siapa yang membuat komentar.

- Kembalikan dengan status code 404; serta
- Berikan body response:
  - status: “fail”
  - message: Pesan apapun selama tidak kosong.

Jika properti body request tidak lengkap atau tidak sesuai, maka:

- Kembalikan dengan status code 400; serta
- Berikan body response:
  - status: “fail”
  - message: Pesan apapun selama tidak kosong.

## Kriteria 3: Menghapus Komentar pada Thread

API harus dapat menghapus komentar pada thread melalui route:

- Method: DELETE
- Path: /threads/{threadId}/comments/{commentId}

Response yang harus dikembalikan:

- Status Code: 200
- Response Body:

```
{
    "status": "success"
}
```

Ketentuan:

- Menghapus komentar pada thread merupakan resource yang dibatasi (restrict). Untuk mengaksesnya membutuhkan access token guna mengetahui siapa yang menghapus komentar.
- Hanya pemilik komentar yang dapat menghapus komentar. Bila bukan pemilik komentar, maka:
  - Kembalikan dengan status code 403; serta
  - Berikan body response:
    - status: “fail”
    - message: Pesan apapun selama tidak kosong.
- Jika thread atau komentar yang hendak dihapus tidak ada atau tidak valid, maka:
  - Kembalikan dengan status code 404; serta
  - Berikan body response: - status: “fail” - message: Pesan apapun selama tidak kosong.
- Komentar dihapus secara soft delete, alias tidak benar-benar dihapus dari database. Anda bisa membuat dan memanfaatkan kolom seperti `is_delete` sebagai indikator apakah komentar dihapus atau tidak.

## Kriteria 4: Melihat Detail Thread

API harus dapat melihat detail thread melalui route:

- Method: GET
- Path: /threads/{threadId}

Response yang harus dikembalikan:

- Status Code: 200
- Response Body:

```
{
    "status": "success",
    "data": {
        "thread": {
            "id": "thread-h_2FkLZhtgBKY2kh4CC02",
            "title": "sebuah thread",
            "body": "sebuah body thread",
            "date": "2021-08-08T07:19:09.775Z",
            "username": "dicoding",
            "comments": [
                {
                    "id": "comment-_pby2_tmXV6bcvcdev8xk",
                    "username": "johndoe",
                    "date": "2021-08-08T07:22:33.555Z",
                    "content": "sebuah comment"
                },
                {
                    "id": "comment-yksuCoxM2s4MMrZJO-qVD",
                    "username": "dicoding",
                    "date": "2021-08-08T07:26:21.338Z",
                    "content": "**komentar telah dihapus**"
                }
            ]
        }
    }
}
```

Ketentuan:

- Mendapatkan detail thread merupakan resource terbuka. Sehingga tidak perlu melampirkan access token.
- Jika thread yang diakses tidak ada atau tidak valid, maka:
  - Kembalikan dengan status code 404; serta
  - Berikan body response:
    - status: “fail”
    - message: Pesan apapun selama tidak kosong.
- Wajib menampilkan seluruh komentar yang terdapat pada thread tersebut sesuai dengan contoh di atas.
- Komentar yang dihapus ditampilkan dengan konten **komentar telah dihapus**.
- Komentar diurutkan secara ascending (dari kecil ke besar) berdasarkan waktu berkomentar.

## Kriteria 5: Menerapkan Automation Testing

Proyek Forum API wajib menerapkan automation testing dengan kriteria berikut:

- Unit Testing:
  - Wajib menerapkan Unit Testing pada bisnis logika yang ada. Baik di Entities ataupun di Use Case.
- Integration Test:
  - Wajib menerapkan Integration Test dalam menguji interaksi database dengan Repository.

## Kriteria 6: Menerapkan Clean Architecture

Proyek Forum API wajib menerapkan Clean Architecture. Di mana source code terdiri dari 4 layer yaitu:

- Entities (jika dibutuhkan)
  - Tempat penyimpanan data entitas bisnis utama. Jika suatu bisnis butuh mengelola struktur data yang kompleks, maka buatlah entities.
- Use Case:
  - Di gunakan sebagai tempat menuliskannya flow atau alur bisnis logika.
- Interface Adapter (Repository dan Handler)
  - Mediator atau penghubung antara layer framework dengan layer use case.
- Frameworks (Database dan HTTP server)
  - Level paling luar merupakan bagian yang berhubungan dengan framework.

## Kriteria Opsional Forum API

Selain kriteria utama, terdapat kriteria opsional yang yang dapat Anda penuhi agar mendapat nilai yang baik.

## Opsional 1 : Menambahkan Balasan pada Komentar Thread

API harus dapat menambahkan balasan pada komentar thread melalui route:

- Method: POST
- Path: /threads/{threadId}/comments/{commentId}/replies
- Body Request:

```
{
    "content": string
}
```

Response yang harus dikembalikan:

- Status Code: 201
- Response Body:

```
{
    "status": "success",
    "data": {
        "addedReply": {
            "id": "reply-BErOXUSefjwWGW1Z10Ihk",
            "content": "sebuah balasan",
            "owner": "user-CrkY5iAgOdMqv36bIvys2"
        }
    }
}
```

**Ketentuan:**

- Menambahkan balasan pada komentar thread merupakan resource yang dibatasi (restrict). Untuk mengaksesnya membutuhkan access token guna mengetahui siapa yang membuat balasan komentar.
- Jika thread atau komentar yang diberi balasan tidak ada atau tidak valid, maka:
  - Kembalikan dengan status code 404; serta
  - Berikan body response:
    - status: “fail”
    - message: Pesan apapun selama tidak kosong.
- Jika properti body request tidak lengkap atau tidak sesuai, maka:
  - Kembalikan dengan status code 400; serta
  - Berikan body response:
    - status: “fail”
    - message: Pesan apapun selama tidak kosong.
- Balasan pada komentar thread harus ditampilkan pada setiap item comments ketika mengakses detail thread. Contohnya seperti ini:

```
{
    "status": "success",
    "data": {
        "thread": {
            "id": "thread-AqVg2b9JyQXR6wSQ2TmH4",
            "title": "sebuah thread",
            "body": "sebuah body thread",
            "date": "2021-08-08T07:59:16.198Z",
            "username": "dicoding",
            "comments": [
                {
                    "id": "comment-q_0uToswNf6i24RDYZJI3",
                    "username": "dicoding",
                    "date": "2021-08-08T07:59:18.982Z",
                    "replies": [
                        {
                            "id": "reply-BErOXUSefjwWGW1Z10Ihk",
                            "content": "**balasan telah dihapus**",
                            "date": "2021-08-08T07:59:48.766Z",
                            "username": "johndoe"
                        },
                        {
                            "id": "reply-xNBtm9HPR-492AeiimpfN",
                            "content": "sebuah balasan",
                            "date": "2021-08-08T08:07:01.522Z",
                            "username": "dicoding"
                        }
                    ],
                    "content": "sebuah comment"
                }
            ]
        }
    }
}

```

- Balasan yang dihapus ditampilkan dengan konten **balasan telah dihapus**.
- Balasan diurutkan secara ascending (dari kecil ke besar) berdasarkan waktu berkomentar.

## Opsional 2 : Menghapus Balasan pada Komentar Thread

API harus dapat menghapus balasan pada komentar thread melalui route:

- Method: DELETE
- Path: /threads/{threadId}/comments/{commentId}/replies/{replyId}

Response yang harus dikembalikan:

- Status Code: 200
- Response Body:

```
{
    "status": "success"
}
```

**Ketentuan:**

- Menghapus balasan pada komentar thread merupakan resource yang dibatasi (restrict). Untuk mengaksesnya membutuhkan access token guna mengetahui siapa yang menghapus balasan.
- Hanya pemilik balasan yang dapat menghapus balasan. Bila bukan pemilik balasan, maka:
  - Kembalikan dengan status code 403; serta
  - Berikan body response:
    - status: “fail”
    - message: Pesan apapun selama tidak kosong.
- Jika thread, komentar, atau balasan yang hendak dihapus tidak ada atau tidak valid, maka:
  - Kembalikan dengan status code 404; serta
  - Berikan body response:
    - status: “fail”
    - message: Pesan apapun selama tidak kosong.
- Balasan dihapus secara soft delete, alias tidak benar-benar dihapus dari database. Anda bisa membuat dan memanfaatkan kolom seperti is_delete sebagai indikator apakah komentar dihapus atau tidak.

## Opsional 3 : Menyukai dan Batal Menyukai Komentar

API harus dapat menyukai/batal menyukai komentar thread melalui route:

- Method: PUT
- Path: /threads/{threadId}/comments/{commentId}/likes

Response yang dikembalikan:

- Status code: 200
- Response body:

```
{
    "status": "success"
}
```

Ketentuan:

- Menyukai dan batal menyukai komentar thread merupakan resource yang dibatasi (restrict). Untuk mengaksesnya membutuhkan access token guna mengetahui siapa yang menyukai komentar.
- Untuk menyukai dan batal menyukai diakses melalui method dan route yang sama.
- Bila user tidak menyukai komentar, maka aksinya adalah menyukai komentar. Jika user sudah menyukai komentar, maka aksinya adalah batal menyukai komentar.
- Jumlah suka (likeCount) pada komentar thread harus ditampilkan pada setiap item comments ketika mengakses detail thread. Contohnya seperti ini:

```
{
    "status": "success",
    "data": {
        "thread": {
            "id": "thread-PJByal62zobLFhUggQo2m",
            "title": "sebuah thread",
            "body": "sebuah body thread",
            "date": "2021-08-13T05:17:12.994Z",
            "username": "dicoding",
            "comments": [
                {
                    "id": "comment-6ptWTV9l16szB-kTKWvy_",
                    "username": "dicoding",
                    "date": "2021-08-13T05:17:13.024Z",
                    "content": "sebuah comment",
                    "likeCount": 2
                },
                {
                    "id": "comment-_KSz7hz-ox__kqTtCjslD",
                    "username": "johndoe",
                    "date": "2021-08-13T05:17:13.057Z",
                    "content": "sebuah comment",
                    "likeCount": 1
                }
            ]
        }
    }
}
```
