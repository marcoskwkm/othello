#include <cstdio>
#include <cstring>
#include <iostream>
#include <utility>
#include <vector>
using namespace std;

typedef unsigned long long HalfBoard;
typedef pair<HalfBoard, HalfBoard> Board;

enum Color { BLACK, WHITE };

const int INF = 0x3f3f3f3f;
const int dr[] = {-1, -1, -1, 0, 1, 1, 1, 0};
const int dc[] = {-1, 0, 1, 1, 1, 0, -1, -1};

Board decodeBoardFromJS(char *encoded_board) {
    HalfBoard black = 0, white = 0;
    for (int i = 0; i < 64; i++) {
        if (encoded_board[i] == 'b') {
            black |= (1ULL << i);
        } else if (encoded_board[i] == 'w') {
            white |= (1ULL << i);
        }
    }
    return Board(black, white);
}

inline Color opposite(Color color) {
    return color == BLACK ? WHITE : BLACK;
}

inline int countPieces(HalfBoard half_board) {
    return __builtin_popcountll(half_board);
}

inline int isValidPosition(int row, int col) {
    return 0 <= row && row <= 7 && 0 <= col && col <= 7;
}

inline bool isSet(HalfBoard half_board, int row, int col) {
    return (half_board & (1ULL << (8 * row + col))) > 0;
}

inline void set(HalfBoard &half_board, int row, int col) {
    half_board |= (1ULL << (8 * row + col));
}

inline void unset(HalfBoard &half_board, int row, int col) {
    half_board &= ~(1ULL << (8 * row + col));
}

const Board INVALID(-1, -1);

Board performMove(Board state, Color turn, int row, int col) {
    HalfBoard black_board, white_board;
    tie(black_board, white_board) = state;

    HalfBoard cur_board, nxt_board;
    if (turn == BLACK) {
        cur_board = black_board;
        nxt_board = white_board;
    } else {
        cur_board = white_board;
        nxt_board = black_board;
    }

    if (!isValidPosition(row, col)) {
        return INVALID;
    }
    if (isSet(black_board, row, col) || isSet(white_board, row, col)) {
        return INVALID;
    }

    HalfBoard next_cur_board = cur_board, next_nxt_board = nxt_board;

    for (int i = 0; i < 8; i++) {
        int nr = row + dr[i], nc = col + dc[i];

        if (!isValidPosition(nr, nc)) {
            continue;
        }
        if (!isSet(nxt_board, nr, nc)) {
            continue;
        }

        do {
            nr += dr[i];
            nc += dc[i];
        } while (isValidPosition(nr, nc) && isSet(nxt_board, nr, nc));

        if (!isValidPosition(nr, nc) || !isSet(cur_board, nr, nc)) {
            continue;
        }

        nr -= dr[i];
        nc -= dc[i];
        while (isSet(nxt_board, nr, nc)) {
            set(next_cur_board, nr, nc);
            unset(next_nxt_board, nr, nc);
            nr -= dr[i];
            nc -= dc[i];
        }

        set(next_cur_board, row, col);
    }

    if (next_cur_board == cur_board && next_nxt_board == nxt_board) {
        return INVALID;
    }

    if (turn == BLACK) {
        return Board(next_cur_board, next_nxt_board);
    } else {
        return Board(next_nxt_board, next_cur_board);
    }
}

inline bool isLegalMove(Board state, Color turn, int row, int col) {
    return performMove(state, turn, row, col) != INVALID;
}

int countLegalMoves(Board state, Color turn) {
    int count = 0;
    for (int row = 0; row < 8; row++) {
        for (int col = 0; col < 8; col++) {
            if (isLegalMove(state, turn, row, col)) {
                count++;
            }
        }
    }
    return count;
}

bool isFixedPiece(Board state, int row, int col) {
    static const int first_r[] = {0, 0, row, row};
    static const int last_r[] = {row, row, 7, 7};
    static const int first_c[] = {0, col, 0, col};
    static const int last_c[] = {col, 7, col, 7};

    HalfBoard black_board, white_board;
    tie(black_board, white_board) = state;

    if (!isSet(black_board, row, col) && !isSet(white_board, row, col)) {
        return false;
    }
    HalfBoard target_board = isSet(black_board, row, col) ? black_board : white_board;

    for (int i = 0; i < 4; i++) {
        bool flag = true;
        for (int row = first_r[i]; row <= last_r[i]; row++) {
            for (int col = first_c[i]; col <= last_c[i]; col++) {
                if (!isSet(target_board, row, col)) {
                    flag = false;
                }
            }
        }
        if (flag) {
            return true;
        }
    }

    return false;
}

int calcPositionScore(Board state, Color turn) {
    static const int cr[] = {0, 0, 7, 7};
    static const int cc[] = {0, 7, 0, 7};

    HalfBoard target_board = turn == BLACK ? state.first : state.second;

    int value = countLegalMoves(state, turn);

    for (int i = 0; i < 4; i++) {
        if (isSet(target_board, cr[i], cc[i])) {
            value += 10;
        }
    }

    for (int row = 0; row < 8; row++) {
        for (int col = 0; col < 8; col++) {
            if (isSet(target_board, row, col) && isFixedPiece(state, row, col)) {
                value += 2;
            }
        }
    }

    return value;
}

bool isGameOver(Board state) {
    return countLegalMoves(state, BLACK) == 0 && countLegalMoves(state, WHITE) == 0;
}

int evaluatePosition(Board state) {
    if (isGameOver(state)) {
        int count_black = countPieces(state.first);
        int count_white = countPieces(state.second);
        if (count_black > count_white) {
            return -1000 * (count_black - count_white);
        } else if (count_white > count_black) {
            return 1000 * (count_white - count_black);
        } else {
            return 0;
        }
    } else {
        return calcPositionScore(state, WHITE) - calcPositionScore(state, BLACK);
    }
}

tuple<int, int, int> minMaxRecursion(Board state, Color turn, int depth) {
    static const int MAX_DEPTH = 4;

    int best_value = (turn == BLACK ? INF : -INF);
    int best_row = -1, best_col = -1;
    bool found_move = false;

    for (int row = 0; row < 8; row++) {
        for (int col = 0; col < 8; col++) {
            Board next_state = performMove(state, turn, row, col);

            if (next_state == INVALID) {
                continue;
            }

            found_move = true;

            int value = (depth == MAX_DEPTH || isGameOver(next_state))
                ? evaluatePosition(next_state)
                : get<0>(minMaxRecursion(next_state, opposite(turn), depth + 1));

            if (
                (turn == BLACK && value < best_value) ||
                (turn == WHITE && value > best_value)
            ) {
                best_value = value;
                best_row = row;
                best_col = col;
            }
        }
    }

    return make_tuple(best_value, best_row, best_col);
}

extern "C" {

char* computeNextMove(char *encoded_board, int turn) {
    Board state = decodeBoardFromJS(encoded_board);
    tuple<int, int, int> move = minMaxRecursion(state, turn == 0 ? BLACK : WHITE, 0);
    char *s = (char*)malloc(10 * sizeof(char));
    sprintf(s, "%d %d", get<1>(move), get<2>(move));
    return s;
}

}
